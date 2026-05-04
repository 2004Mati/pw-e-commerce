import Link from "next/link";
import { products } from "../../data/products";

export const metadata = {
  title: "Catálogo | Chronos Premium",
  description: "Catálogo de relojes premium Chronos"
};

export default function CatalogoPage() {
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
          </nav>

          <div className="carrito-resumen">Ruta Next: /catalogo</div>
        </div>
      </header>

      <main className="catalogo-page">
        <section className="seccion coleccion">
          <div className="container">
            <div className="titulo-seccion">
              <p className="subtitulo">Ruta independiente</p>
              <h2>Catálogo completo</h2>
            </div>

            <p className="catalogo-aclaracion">
              Esta página existe para mostrar una ruta de Next.js distinta de la
              home. Los productos siguen siendo los mismos, pero acá la vista está
              separada por ruta.
            </p>

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
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-contenido">
          <p>Chronos Premium — Catálogo en Next.js.</p>
          <p>Proyecto académico de Programación Web.</p>
        </div>
      </footer>
    </>
  );
}