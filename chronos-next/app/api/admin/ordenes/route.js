import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function successResponse(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

function errorResponse(error, code, status = 500) {
  return Response.json({ success: false, error, code }, { status });
}

function crearClienteConToken(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

async function verificarAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { supabase: null, error: errorResponse("No autenticado.", "UNAUTHORIZED", 401) };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = crearClienteConToken(token);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { supabase: null, error: errorResponse("No autenticado.", "UNAUTHORIZED", 401) };
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") {
    return { supabase: null, error: errorResponse("Acceso denegado.", "FORBIDDEN", 403) };
  }

  return { supabase, error: null };
}

export async function GET(request) {
  try {
    const { supabase, error } = await verificarAdmin(request);
    if (error) return error;

    const { data, error: dbError } = await supabase
      .from("ordenes")
      .select(`
        id, total, estado, creado_en, metodo_pago, referencia_pago, pagado_en,
        usuarios ( email ),
        orden_items (
          cantidad, precio_unitario, subtotal,
          productos ( nombre )
        )
      `)
      .order("creado_en", { ascending: false });

    if (dbError) return errorResponse("Error al obtener órdenes.", "DB_ERROR", 500);

    return successResponse(data);
  } catch {
    return errorResponse("Error interno.", "INTERNAL_SERVER_ERROR", 500);
  }
}

// Los estados de pago (pendiente/pagada) los fija el sistema vía webhook de
// Mercado Pago; el admin solo avanza el ciclo de la orden o la cancela.
const TRANSICIONES = {
  pendiente: ["cancelada"],
  pagada: ["confirmada", "cancelada"],
  confirmada: ["enviada", "cancelada"],
  enviada: ["entregada"],
  entregada: [],
  cancelada: []
};

export async function PATCH(request) {
  try {
    const { supabase, error } = await verificarAdmin(request);
    if (error) return error;

    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return errorResponse("ID y estado requeridos.", "INVALID_DATA", 400);
    }

    const { data: ordenActual, error: buscarError } = await supabase
      .from("ordenes")
      .select("estado")
      .eq("id", id)
      .single();

    if (buscarError || !ordenActual) {
      return errorResponse("La orden no existe.", "ORDER_NOT_FOUND", 404);
    }

    const permitidos = TRANSICIONES[ordenActual.estado] || [];
    if (!permitidos.includes(estado)) {
      return errorResponse(
        `No se puede pasar una orden de "${ordenActual.estado}" a "${estado}".`,
        "INVALID_TRANSITION",
        400
      );
    }

    const { data, error: dbError } = await supabase
      .from("ordenes")
      .update({ estado })
      .eq("id", id)
      .select()
      .single();

    if (dbError) return errorResponse("Error al actualizar orden.", "DB_ERROR", 500);

    return successResponse(data);
  } catch {
    return errorResponse("Error interno.", "INTERNAL_SERVER_ERROR", 500);
  }
}
