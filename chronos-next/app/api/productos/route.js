import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return Response.json(
        {
          success: false,
          error: "No se pudieron cargar los productos.",
          code: "PRODUCTS_FETCH_ERROR"
        },
        { status: 500 }
      );
    }

    const products = data.map((product) => ({
      id: String(product.id),
      name: product.nombre,
      description: product.descripcion,
      price: Number(product.precio),
      stock: Number(product.stock),
      image: product.imagen_url,
      category: product.categoria,
      alt: `Reloj ${product.nombre}`
    }));

    return Response.json(
      {
        success: true,
        data: products
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Error interno al obtener productos.",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}