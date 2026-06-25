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

export async function POST(request) {
  try {
    const { user, supabase, error } = await obtenerUsuarioAutenticado(request);

    if (error) {
      return error;
    }

    const body = await request.json();
    const ordenId = Number(body.orden_id);

    if (!ordenId || Number.isNaN(ordenId)) {
      return errorResponse(
        "El ID de la orden es obligatorio.",
        "INVALID_ORDER_ID",
        400
      );
    }

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes")
      .select(
        `
        id,
        usuario_id,
        total,
        estado,
        metodo_pago,
        referencia_pago,
        pagado_en
      `
      )
      .eq("id", ordenId)
      .single();

    if (ordenError || !orden) {
      return errorResponse(
        "La orden no existe.",
        "ORDER_NOT_FOUND",
        404
      );
    }

    if (orden.usuario_id !== user.id) {
      return errorResponse(
        "No tenés permiso para confirmar esta orden.",
        "FORBIDDEN_ORDER",
        401
      );
    }

    if (orden.estado !== "pendiente") {
      return errorResponse(
        "La orden no está pendiente de pago.",
        "ORDER_NOT_PENDING",
        400
      );
    }

    if (!orden.referencia_pago) {
      return errorResponse(
        "La orden todavía no tiene una preferencia de pago creada.",
        "PAYMENT_PREFERENCE_NOT_FOUND",
        400
      );
    }

    const fechaPago = new Date().toISOString();

    const { data: ordenActualizada, error: actualizarError } = await supabase
      .from("ordenes")
      .update({
        estado: "pagada",
        pagado_en: fechaPago
      })
      .eq("id", orden.id)
      .select(
        `
        id,
        total,
        estado,
        metodo_pago,
        referencia_pago,
        pagado_en,
        creado_en
      `
      )
      .single();

    if (actualizarError) {
      return errorResponse(
        "No se pudo confirmar el pago.",
        "PAYMENT_CONFIRMATION_ERROR",
        500
      );
    }

    return successResponse(
      {
        orden: ordenActualizada,
        mensaje: "Pago confirmado correctamente."
      },
      200
    );
  } catch (error) {
    return errorResponse(
      "Error interno al confirmar el pago.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}