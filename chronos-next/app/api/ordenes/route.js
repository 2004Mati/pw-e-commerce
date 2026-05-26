import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function successResponse(data, status = 200) {
  return Response.json(
    {
      success: true,
      data
    },
    { status }
  );
}

function errorResponse(error, code, status = 500) {
  return Response.json(
    {
      success: false,
      error,
      code
    },
    { status }
  );
}

function crearClienteSupabaseConToken(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}

async function obtenerUsuarioAutenticado(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      user: null,
      supabase: null,
      error: errorResponse("Usuario no autenticado.", "UNAUTHORIZED", 401)
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = crearClienteSupabaseConToken(token);

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      supabase: null,
      error: errorResponse("Usuario no autenticado.", "UNAUTHORIZED", 401)
    };
  }

  return {
    user,
    supabase,
    error: null
  };
}

export async function GET(request) {
  try {
    const { user, supabase, error } = await obtenerUsuarioAutenticado(request);

    if (error) {
      return error;
    }

    const { data: ordenes, error: ordenesError } = await supabase
      .from("ordenes")
      .select(
        `
        id,
        total,
        estado,
        creado_en,
        orden_items (
          id,
          producto_id,
          cantidad,
          precio_unitario,
          subtotal,
          productos (
            id,
            nombre,
            descripcion,
            imagen_url
          )
        )
      `
      )
      .eq("usuario_id", user.id)
      .order("creado_en", { ascending: false });

    if (ordenesError) {
      return errorResponse(
        "No se pudieron cargar las órdenes.",
        "ORDERS_FETCH_ERROR",
        500
      );
    }

    const ordenesFormateadas = ordenes.map((orden) => ({
      id: orden.id,
      total: Number(orden.total),
      estado: orden.estado,
      creado_en: orden.creado_en,
      items: orden.orden_items.map((item) => ({
        id: item.id,
        producto_id: item.producto_id,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
        subtotal: Number(item.subtotal),
        producto: item.productos
          ? {
              id: item.productos.id,
              nombre: item.productos.nombre,
              descripcion: item.productos.descripcion,
              imagen_url: item.productos.imagen_url
            }
          : null
      }))
    }));

    return successResponse(ordenesFormateadas, 200);
  } catch (error) {
    return errorResponse(
      "Error interno al cargar las órdenes.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}

export async function POST(request) {
  try {
    const { user, supabase, error } = await obtenerUsuarioAutenticado(request);

    if (error) {
      return error;
    }

    const { data: carrito, error: carritoError } = await supabase
      .from("carrito")
      .select(
        `
        id,
        cantidad,
        producto_id,
        productos (
          id,
          nombre,
          precio,
          stock
        )
      `
      )
      .eq("usuario_id", user.id)
      .order("id", { ascending: true });

    if (carritoError) {
      return errorResponse(
        "No se pudo leer el carrito.",
        "CART_FETCH_ERROR",
        500
      );
    }

    if (!carrito || carrito.length === 0) {
      return errorResponse("El carrito está vacío.", "EMPTY_CART", 400);
    }

    for (const item of carrito) {
      if (!item.productos) {
        return errorResponse(
          "Uno de los productos del carrito ya no existe.",
          "PRODUCT_NOT_FOUND",
          404
        );
      }

      if (Number(item.cantidad) <= 0) {
        return errorResponse(
          "El carrito contiene una cantidad inválida.",
          "INVALID_QUANTITY",
          400
        );
      }

      if (Number(item.productos.stock) < Number(item.cantidad)) {
        return errorResponse(
          `Stock insuficiente para ${item.productos.nombre}.`,
          "INSUFFICIENT_STOCK",
          400
        );
      }
    }

    const total = carrito.reduce((acc, item) => {
      return acc + Number(item.productos.precio) * Number(item.cantidad);
    }, 0);

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes")
      .insert({
        usuario_id: user.id,
        total,
        estado: "confirmada"
      })
      .select("id, usuario_id, total, estado, creado_en")
      .single();

    if (ordenError) {
      return errorResponse(
        "No se pudo crear la orden.",
        "ORDER_CREATE_ERROR",
        500
      );
    }

    const ordenItems = carrito.map((item) => ({
      orden_id: orden.id,
      producto_id: Number(item.producto_id),
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.productos.precio),
      subtotal: Number(item.productos.precio) * Number(item.cantidad)
    }));

    const { error: itemsError } = await supabase
      .from("orden_items")
      .insert(ordenItems);

    if (itemsError) {
      return errorResponse(
        "La orden se creó, pero no se pudieron guardar sus productos.",
        "ORDER_ITEMS_CREATE_ERROR",
        500
      );
    }

    const { error: limpiarCarritoError } = await supabase
      .from("carrito")
      .delete()
      .eq("usuario_id", user.id);

    if (limpiarCarritoError) {
      return errorResponse(
        "La compra se creó, pero no se pudo vaciar el carrito.",
        "CART_CLEAR_ERROR",
        500
      );
    }

    return successResponse(
      {
        orden,
        items: ordenItems
      },
      201
    );
  } catch (error) {
    return errorResponse(
      "Error interno al finalizar la compra.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}