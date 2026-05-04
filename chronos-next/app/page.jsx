"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { benefits, products } from "../data/products";

function Header({ cartCount }) {
  return (
    <header className="header">
      <div className="container header-contenido">
        <h1 className="logo">CHRONOS</h1>

        <nav className="nav" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#coleccion">Colección</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#contacto">Contacto</a>
          <Link href="/catalogo">Catálogo</Link>
        </nav>

        <div className="carrito-resumen">
          Carrito: <span>{cartCount}</span>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="card-producto">
      <img className="imagen-producto" src={product.image} alt={product.alt} />
      <h3>{product.name}</h3>
      <p className="descripcion">{product.description}</p>
      <p className="precio">USD {product.price}</p>
      <button type="button" className="boton" onClick={() => onAdd(product)}>
        Agregar al carrito
      </button>
    </article>
  );
}

function CartPanel({
  cartItems,
  totalItems,
  totalPrice,
  onIncrease,
  onDecrease,
  onDelete,
  onClear
}) {
  return (
    <section className="carrito-panel" aria-labelledby="titulo-carrito">
      <div className="carrito-header">
        <h3 id="titulo-carrito">Carrito de compras</h3>
        <button type="button" className="boton-secundario" onClick={onClear}>
          Vaciar carrito
        </button>
      </div>

      <div className="carrito-contenido">
        {cartItems.length === 0 ? (
          <p className="carrito-vacio">Todavía no agregaste productos.</p>
        ) : (
          cartItems.map((product) => {
            const subtotal = product.price * product.quantity;

            return (
              <div className="item-carrito" key={product.id}>
                <div className="item-info">
                  <h4>{product.name}</h4>
                  <p>USD {product.price}</p>
                </div>

                <div className="item-cantidad">
                  <button
                    type="button"
                    className="boton-cantidad"
                    onClick={() => onDecrease(product.id)}
                  >
                    -
                  </button>
                  <span>{product.quantity}</span>
                  <button
                    type="button"
                    className="boton-cantidad"
                    onClick={() => onIncrease(product.id)}
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">USD {subtotal}</div>

                <div>
                  <button
                    type="button"
                    className="boton-eliminar"
                    onClick={() => onDelete(product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="carrito-footer">
        <p>Total de productos: <span>{totalItems}</span></p>
        <p>Total estimado: <span>USD {totalPrice}</span></p>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section id="beneficios" className="seccion beneficios">
      <div className="container">
        <div className="titulo-seccion">
          <p className="subtitulo">Por qué elegirnos</p>
          <h2>Experiencia Chronos</h2>
        </div>

        <div className="grid-beneficios">
          {benefits.map((benefit) => (
            <article className="card-beneficio" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();

    if (email === "") {
      setMessage("Por favor, ingresá un email.");
      setMessageType("error");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Ingresá un email válido.");
      setMessageType("error");
      return;
    }

    setMessage("¡Gracias por suscribirte a Chronos Premium!");
    setMessageType("success");
    form.reset();
  }

  return (
    <section id="contacto" className="seccion contacto">
      <div className="container contacto-contenido">
        <div>
          <p className="subtitulo">Novedades exclusivas</p>
          <h2>Sumate a Chronos Premium</h2>
          <p>
            Dejanos tu email para enterarte de lanzamientos, nuevas colecciones y
            promociones especiales.
          </p>
        </div>

        <form className="formulario" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            required
          />
          <button type="submit" className="boton">
            Suscribirme
          </button>
        </form>

        <p
          className={`mensaje ${
            messageType === "error"
              ? "mensaje-error"
              : messageType === "success"
              ? "mensaje-exito"
              : ""
          }`}
        >
          {message}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-contenido">
        <p>Chronos Premium — Elegancia en cada segundo.</p>
        <p>Proyecto académico de Programación Web.</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [cart, setCart] = useState({});
  const [cartMessage, setCartMessage] = useState("");

  function showCartMessage(text) {
    setCartMessage(text);
    setTimeout(() => {
      setCartMessage("");
    }, 2000);
  }

  function addToCart(product) {
    setCart((prevCart) => {
      const existingProduct = prevCart[product.id];

      if (existingProduct) {
        return {
          ...prevCart,
          [product.id]: {
            ...existingProduct,
            quantity: existingProduct.quantity + 1
          }
        };
      }

      return {
        ...prevCart,
        [product.id]: {
          ...product,
          quantity: 1
        }
      };
    });

    showCartMessage("Producto agregado al carrito.");
  }

  function increaseQuantity(productId) {
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: {
        ...prevCart[productId],
        quantity: prevCart[productId].quantity + 1
      }
    }));
  }

  function decreaseQuantity(productId) {
    setCart((prevCart) => {
      const currentProduct = prevCart[productId];

      if (!currentProduct) return prevCart;

      if (currentProduct.quantity === 1) {
        const updatedCart = { ...prevCart };
        delete updatedCart[productId];
        return updatedCart;
      }

      return {
        ...prevCart,
        [productId]: {
          ...currentProduct,
          quantity: currentProduct.quantity - 1
        }
      };
    });
  }

  function deleteProduct(productId) {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[productId];
      return updatedCart;
    });
  }

  function clearCart() {
    setCart({});
    showCartMessage("Carrito vaciado.");
  }

  const cartItems = Object.values(cart);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, product) => acc + product.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
  }, [cartItems]);

  return (
    <>
      <Header cartCount={totalItems} />

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-contenido">
            <p className="etiqueta">Colección exclusiva 2026</p>
            <h2>Relojes premium con diseño, carácter y precisión</h2>
            <p className="hero-texto">
              Explorá una línea de relojes pensada para quienes buscan elegancia,
              presencia y detalles que marquen diferencia en cada ocasión.
            </p>
            <a className="boton" href="#coleccion">
              Explorar colección
            </a>
          </div>
        </section>

        <section id="coleccion" className="seccion coleccion">
          <div className="container">
            <div className="titulo-seccion">
              <p className="subtitulo">Modelos destacados</p>
              <h2>Nuestra colección</h2>
            </div>

            <div className="grid-productos">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>

            <p className="mensaje">{cartMessage}</p>

            <CartPanel
              cartItems={cartItems}
              totalItems={totalItems}
              totalPrice={totalPrice}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onDelete={deleteProduct}
              onClear={clearCart}
            />
          </div>
        </section>

        <BenefitsSection />
        <NewsletterForm />
      </main>

      <Footer />
    </>
  );
}