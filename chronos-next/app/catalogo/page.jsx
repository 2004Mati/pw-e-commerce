import Link from "next/link";
import { supabase } from "../../lib/supabase";

export const metadata = {
  title: "Catálogo | Chronos Premium",
  description: "Catálogo de relojes premium Chronos"
};

export default async function CatalogoPage() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar productos:", error);
  }

  const products = (data || []).map((product) => ({
    id: product.id,
    name: product.nombre,
    description: product.descripcion,
    price: Number(product.precio),
    image: product.imagen_url,
    alt: `Reloj ${product.nombre}`
  }));

  return (
    <>
      <header className="header">
        <div className="container header-contenido">
          <h1 className="logo">CHRONOS</h1>

          <nav className="nav" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/#coleccion">Colección</Link>
            <Link href="/#beneficios">Beneficios</Link>
            <Link href="/#contacto">Contacto</Link>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/mis-compras">Mis compras</Link>
          </nav>

          <div className="carrito-resumen">Catálogo</div>
        </div>
      </header>

      <main className="catalogo-page">
        <section className="catalogo-contenido">
          <div className="container">
            {error ? (
              <p className="mensaje mensaje-error">
                No se pudieron cargar los productos.
              </p>
            ) : (
              <div className="grid-productos">
                {products.map((product) => (
                  <article className="card-producto" key={product.id}>
                    <img
                      className="imagen-producto"
                      src={product.image}
                      alt={product.alt}
                    />

                    <h3>{product.name}</h3>
                    <p className="descripcion">{product.description}</p>
                    <p className="precio">USD {product.price}</p>

                    <Link href="/#coleccion" className="boton">
                      Comprar desde inicio
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-contenido">
          <p>Chronos Premium — Elegancia en cada segundo.</p>
          <p>Diseño, precisión y estilo.</p>
        </div>
      </footer>
    </>
  );
}