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

function validarCantidad(cantidad) {
  return (
    Number.isInteger(cantidad) &&
    cantidad > 0 &&
    cantidad <= 100
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
      error: errorResponse(
        "Usuario no autenticado.",
        "UNAUTHORIZED",
        401
      )
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
      error: errorResponse(
        "Usuario no autenticado.",
        "UNAUTHORIZED",
        401
      )
    };
  }

  return {
    user,
    supabase,
    error: null
  };
}

export async function POST(request) {
  try {
    const { user, supabase, error } = await obtenerUsuarioAutenticado(request);

    if (error) {
      return error;
    }

    const body = await request.json();

    const productoId = Number(body.producto_id);
    const cantidad = Number(body.cantidad);

    if (!productoId || !validarCantidad(cantidad)) {
      return errorResponse(
        "Datos inválidos. Se requiere producto_id válido y cantidad entre 1 y 100.",
        "INVALID_CART_DATA",
        400
      );
    }

    const { data: producto, error: productoError } = await supabase
      .from("productos")
      .select("id, nombre, descripcion, precio, stock, imagen_url")
      .eq("id", productoId)
      .single();

    if (productoError || !producto) {
      return errorResponse(
        "El producto no existe.",
        "PRODUCT_NOT_FOUND",
        404
      );
    }

    const { data: itemExistente, error: itemError } = await supabase
      .from("carrito")
      .select("id, cantidad")
      .eq("usuario_id", user.id)
      .eq("producto_id", productoId)
      .maybeSingle();

    if (itemError) {
      return errorResponse(
        "No se pudo verificar el carrito.",
        "CART_CHECK_ERROR",
        500
      );
    }

    const cantidadActual = itemExistente ? Number(itemExistente.cantidad) : 0;
    const nuevaCantidad = cantidadActual + cantidad;

    if (producto.stock < nuevaCantidad) {
      return errorResponse(
        "Stock insuficiente para agregar esa cantidad.",
        "INSUFFICIENT_STOCK",
        400
      );
    }

    if (itemExistente) {
      const { data: itemActualizado, error: updateError } = await supabase
        .from("carrito")
        .update({ cantidad: nuevaCantidad })
        .eq("id", itemExistente.id)
        .select("id, producto_id, cantidad")
        .single();

      if (updateError) {
        return errorResponse(
          "No se pudo actualizar el carrito.",
          "CART_UPDATE_ERROR",
          500
        );
      }

      return successResponse(
        {
          item: itemActualizado,
          producto: {
            id: String(producto.id),
            name: producto.nombre,
            description: producto.descripcion,
            price: Number(producto.precio),
            stock: Number(producto.stock),
            image: producto.imagen_url,
            alt: `Reloj ${producto.nombre}`
          }
        },
        200
      );
    }

    const { data: itemCreado, error: insertError } = await supabase
      .from("carrito")
      .insert({
        usuario_id: user.id,
        producto_id: productoId,
        cantidad
      })
      .select("id, producto_id, cantidad")
      .single();

    if (insertError) {
      return errorResponse(
        "No se pudo agregar el producto al carrito.",
        "CART_INSERT_ERROR",
        500
      );
    }

    return successResponse(
      {
        item: itemCreado,
        producto: {
          id: String(producto.id),
          name: producto.nombre,
          description: producto.descripcion,
          price: Number(producto.precio),
          stock: Number(producto.stock),
          image: producto.imagen_url,
          alt: `Reloj ${producto.nombre}`
        }
      },
      201
    );
  } catch (error) {
    return errorResponse(
      "Error interno al procesar el carrito.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}