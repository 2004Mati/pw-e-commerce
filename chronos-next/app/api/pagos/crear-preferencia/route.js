import { createClient } from "@supabase/supabase-js";
import { client, Preference } from "../../../../lib/mercadopago";

export const dynamic = "force-dynamic";

function successResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

function errorResponse(error, code, status = 500) {
  return Response.json({ success: false, error, code }, { status });
}

function crearClienteSupabaseConToken(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
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

  return { user, supabase, error: null };
}

export async function POST(request) {
  try {
    const { user, supabase, error } = await obtenerUsuarioAutenticado(request);

    if (error) return error;

    const body = await request.json();
    const ordenId = Number(body.orden_id);

    if (!ordenId || Number.isNaN(ordenId)) {
      return errorResponse("El ID de la orden es obligatorio.", "INVALID_ORDER_ID", 400);
    }

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes")
      .select(`
        id,
        usuario_id,
        total,
        estado,
        orden_items (
          cantidad,
          precio_unitario,
          productos (
            id,
            nombre,
            descripcion,
            imagen_url
          )
        )
      `)
      .eq("id", ordenId)
      .single();

    if (ordenError || !orden) {
      return errorResponse("La orden no existe.", "ORDER_NOT_FOUND", 404);
    }

    if (orden.usuario_id !== user.id) {
      return errorResponse("No tenés permiso para pagar esta orden.", "FORBIDDEN_ORDER", 401);
    }

    if (orden.estado !== "pendiente") {
      return errorResponse("La orden no está pendiente de pago.", "ORDER_NOT_PENDING", 400);
    }

    if (!orden.orden_items || orden.orden_items.length === 0) {
      return errorResponse("La orden no tiene ítems.", "EMPTY_ORDER", 400);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const items = orden.orden_items.map((item) => ({
      id: String(item.productos?.id || "producto"),
      title: item.productos?.nombre || "Producto Chronos",
      description: item.productos?.descripcion || "Reloj Chronos",
      picture_url: item.productos?.imagen_url || undefined,
      category_id: "fashion",
      quantity: Number(item.cantidad),
      unit_price: Number(item.precio_unitario),
      currency_id: "ARS"
    }));

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("email, nombre, apellido")
      .eq("id", user.id)
      .single();

    const preference = new Preference(client);

    const preferenceData = {
      items,
      payer: {
        email: perfil?.email || user.email
      },
      back_urls: {
        success: `${appUrl}/pago-completado`,
        failure: `${appUrl}/pago-fallido`,
        pending: `${appUrl}/pago-pendiente`
      },
      external_reference: `orden_${ordenId}`,
      notification_url: `${appUrl}/api/webhooks/mercado-pago`
    };

    const resultado = await preference.create({ body: preferenceData });

    await supabase
      .from("ordenes")
      .update({
        metodo_pago: "mercado_pago",
        referencia_pago: resultado.id
      })
      .eq("id", ordenId);

    return successResponse({
      preference_id: resultado.id,
      init_point: resultado.init_point,
      sandbox_init_point: resultado.sandbox_init_point
    }, 201);
  } catch (err) {
    console.error("[MP Error]", err);
    return errorResponse(
      "Error interno al crear la preferencia de pago.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}
