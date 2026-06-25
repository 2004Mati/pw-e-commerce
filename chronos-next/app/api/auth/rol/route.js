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

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id, email, rol")
      .eq("id", user.id)
      .single();

    if (usuarioError || !usuario) {
      return errorResponse(
        "No se encontró el usuario en la tabla usuarios.",
        "USER_PROFILE_NOT_FOUND",
        404
      );
    }

    return successResponse(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      200
    );
  } catch (error) {
    return errorResponse(
      "Error interno al obtener el rol.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}