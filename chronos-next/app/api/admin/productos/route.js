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
      .from("productos")
      .select("id, nombre, precio, stock, categoria, imagen_url, descripcion")
      .order("id", { ascending: true });

    if (dbError) return errorResponse("Error al obtener productos.", "DB_ERROR", 500);

    return successResponse(data);
  } catch {
    return errorResponse("Error interno.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function PATCH(request) {
  try {
    const { supabase, error } = await verificarAdmin(request);
    if (error) return error;

    const body = await request.json();
    const { id, precio, stock } = body;

    if (!id) return errorResponse("ID requerido.", "INVALID_ID", 400);

    const cambios = {};
    if (precio !== undefined) cambios.precio = Number(precio);
    if (stock !== undefined) cambios.stock = Number(stock);

    if (Object.keys(cambios).length === 0) {
      return errorResponse("Nada que actualizar.", "NO_CHANGES", 400);
    }

    cambios.actualizado_en = new Date().toISOString();

    const { data, error: dbError } = await supabase
      .from("productos")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();

    if (dbError) return errorResponse("Error al actualizar producto.", "DB_ERROR", 500);

    return successResponse(data);
  } catch {
    return errorResponse("Error interno.", "INTERNAL_SERVER_ERROR", 500);
  }
}
