"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { benefits } from "../data/products";
import { supabase } from "../lib/supabase";

function UserIcon() {
  return (
    <svg className="header-icono" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 22C4.8 17.8 7.7 15.5 12 15.5C16.3 15.5 19.2 17.8 20 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="header-icono" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3H5.2L7.4 14.2C7.6 15.2 8.5 16 9.6 16H18.3C19.3 16 20.2 15.3 20.5 14.3L22 8H6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21C10.5523 21 11 20.5523 11 20C11 19.4477 10.5523 19 10 19C9.44772 19 9 19.4477 9 20C9 20.5523 9.44772 21 10 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M18 21C18.5523 21 19 20.5523 19 20C19 19.4477 18.5523 19 18 19C17.4477 19 17 19.4477 17 20C17 20.5523 17.4477 21 18 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Header({ cartCount, userInitial, userRole, onOpenCart }) {
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
          <Link href="/mis-compras">Mis compras</Link>

          {userRole === "admin" && <Link href="/admin">Admin</Link>}
        </nav>

        <div className="header-acciones">
          {userInitial ? (
            <Link href="/auth/login" className="usuario-circulo" aria-label="Ver cuenta">
              {userInitial}
            </Link>
          ) : (
            <Link href="/auth/login" className="icono-header-boton" aria-label="Iniciar sesión">
              <UserIcon />
            </Link>
          )}

          <button
            type="button"
            className="icono-header-boton carrito-icono-boton"
            onClick={onOpenCart}
            aria-label="Abrir carrito"
          >
            <CartIcon />
            {cartCount > 0 && <span className="carrito-badge">{cartCount}</span>}
          </button>
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

function CartDrawer({
  isOpen,
  cartItems,
  totalItems,
  totalPrice,
  checkoutMessage,
  checkoutLoading,
  onIncrease,
  onDecrease,
  onDelete,
  onClear,
  onCheckout,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="carrito-drawer"
        aria-label="Carrito de compras"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="subtitulo drawer-subtitulo">Tu selección</p>
            <h2>Carrito</h2>
          </div>

          <button type="button" className="drawer-cerrar" onClick={onClose} aria-label="Cerrar carrito">
            ×
          </button>
        </div>

        <div className="drawer-contenido">
          {cartItems.length === 0 ? (
            <p className="carrito-vacio">Todavía no agregaste productos al carrito.</p>
          ) : (
            cartItems.map((product) => {
              const subtotal = product.price * product.quantity;

              return (
                <div className="drawer-item" key={product.id}>
                  <div className="drawer-item-info">
                    <h3>{product.name}</h3>
                    <p>USD {product.price}</p>
                  </div>

                  <div className="drawer-item-controles">
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

                    <strong>USD {subtotal}</strong>

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

        <div className="drawer-footer">
          <div className="drawer-totales">
            <p>
              Total de productos: <span>{totalItems}</span>
            </p>
            <p>
              Total estimado: <span>USD {totalPrice}</span>
            </p>
          </div>

          {checkoutMessage && <p className="mensaje mensaje-exito">{checkoutMessage}</p>}

          <div className="drawer-botones">
            <button type="button" className="boton-secundario" onClick={onClear}>
              Vaciar carrito
            </button>

            <button
              type="button"
              className="boton"
              onClick={onCheckout}
              disabled={checkoutLoading || cartItems.length === 0}
            >
              {checkoutLoading ? "Procesando..." : "Finalizar compra"}
            </button>
          </div>

          <button type="button" className="boton-secundario drawer-boton-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </aside>
    </div>
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
        <p>Diseño, precisión y estilo.</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [cart, setCart] = useState({});
  const [cartMessage, setCartMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsMessage, setProductsMessage] = useState("");
  const [userInitial, setUserInitial] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/productos");
        const result = await response.json();

        if (!response.ok || !result.success) {
          setProductsMessage(result.error || "No se pudieron cargar los productos.");
          setLoadingProducts(false);
          return;
        }

        setProducts(result.data);
        setLoadingProducts(false);
      } catch (error) {
        setProductsMessage("No se pudieron cargar los productos.");
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  async function loadUserRole(accessToken) {
    try {
      const response = await fetch("/api/auth/rol", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setUserRole("");
        return;
      }

      setUserRole(result.data.rol || "");
    } catch (error) {
      setUserRole("");
    }
  }

  async function loadCartFromSupabase(currentUserId) {
    const { data, error } = await supabase
      .from("carrito")
      .select(
        `
        id,
        cantidad,
        producto_id,
        productos (
          id,
          nombre,
          descripcion,
          precio,
          imagen_url
        )
      `
      )
      .eq("usuario_id", currentUserId)
      .order("id", { ascending: true });

    if (error) {
      showCartMessage("No se pudo cargar el carrito.");
      return;
    }

    const cartObject = {};

    data.forEach((item) => {
      if (!item.productos) return;

      cartObject[String(item.producto_id)] = {
        cartRowId: item.id,
        id: String(item.producto_id),
        name: item.productos.nombre,
        description: item.productos.descripcion,
        price: Number(item.productos.precio),
        image: item.productos.imagen_url,
        alt: `Reloj ${item.productos.nombre}`,
        quantity: item.cantidad
      };
    });

    setCart(cartObject);
  }

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session?.user?.id && session?.user?.email) {
        setUserId(session.user.id);
        setUserInitial(session.user.email.charAt(0).toUpperCase());
        await loadUserRole(session.access_token);
        await loadCartFromSupabase(session.user.id);
      } else {
        setUserId("");
        setUserInitial("");
        setUserRole("");
        setCart({});
      }
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id && session?.user?.email) {
        setUserId(session.user.id);
        setUserInitial(session.user.email.charAt(0).toUpperCase());
        loadUserRole(session.access_token);
        loadCartFromSupabase(session.user.id);
      } else {
        setUserId("");
        setUserInitial("");
        setUserRole("");
        setCart({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function showCartMessage(text) {
    setCartMessage(text);
    setTimeout(() => {
      setCartMessage("");
    }, 2000);
  }

  function showCheckoutMessage(text) {
    setCheckoutMessage(text);
    setTimeout(() => {
      setCheckoutMessage("");
    }, 3000);
  }

  async function addToCart(product) {
    if (!userId) {
      window.location.href = "/auth/login";
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const response = await fetch("/api/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          producto_id: Number(product.id),
          cantidad: 1
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showCartMessage(result.error || "No se pudo agregar el producto.");
        return;
      }

      const item = result.data.item;
      const producto = result.data.producto;

      setCart((prevCart) => ({
        ...prevCart,
        [String(item.producto_id)]: {
          ...producto,
          id: String(item.producto_id),
          cartRowId: item.id,
          quantity: Number(item.cantidad)
        }
      }));

      showCartMessage("Producto agregado al carrito.");
    } catch (error) {
      showCartMessage("No se pudo agregar el producto.");
    }
  }

  async function increaseQuantity(productId) {
    const currentProduct = cart[productId];

    if (!currentProduct) return;

    const newQuantity = currentProduct.quantity + 1;

    const { error } = await supabase
      .from("carrito")
      .update({ cantidad: newQuantity })
      .eq("id", currentProduct.cartRowId);

    if (error) {
      showCartMessage("No se pudo actualizar la cantidad.");
      return;
    }

    setCart((prevCart) => ({
      ...prevCart,
      [productId]: {
        ...currentProduct,
        quantity: newQuantity
      }
    }));
  }

  async function decreaseQuantity(productId) {
    const currentProduct = cart[productId];

    if (!currentProduct) return;

    if (currentProduct.quantity === 1) {
      await deleteProduct(productId);
      return;
    }

    const newQuantity = currentProduct.quantity - 1;

    const { error } = await supabase
      .from("carrito")
      .update({ cantidad: newQuantity })
      .eq("id", currentProduct.cartRowId);

    if (error) {
      showCartMessage("No se pudo actualizar la cantidad.");
      return;
    }

    setCart((prevCart) => ({
      ...prevCart,
      [productId]: {
        ...currentProduct,
        quantity: newQuantity
      }
    }));
  }

  async function deleteProduct(productId) {
    const currentProduct = cart[productId];

    if (!currentProduct) return;

    const { error } = await supabase
      .from("carrito")
      .delete()
      .eq("id", currentProduct.cartRowId);

    if (error) {
      showCartMessage("No se pudo eliminar el producto.");
      return;
    }

    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[productId];
      return updatedCart;
    });
  }

  async function clearCart() {
    if (!userId) {
      setCart({});
      return;
    }

    const { error } = await supabase.from("carrito").delete().eq("usuario_id", userId);

    if (error) {
      showCartMessage("No se pudo vaciar el carrito.");
      return;
    }

    setCart({});
    showCartMessage("Carrito vaciado.");
  }

  async function finalizePurchase() {
    const cartItems = Object.values(cart);

    if (!userId) {
      window.location.href = "/auth/login";
      return;
    }

    if (cartItems.length === 0) {
      showCheckoutMessage("El carrito está vacío.");
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/auth/login";
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage("");

    try {
      const response = await fetch("/api/ordenes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setCheckoutLoading(false);
        showCheckoutMessage(result.error || "No se pudo finalizar la compra.");
        return;
      }

      setCart({});
      setCheckoutLoading(false);
      window.location.href = `/checkout?orden_id=${result.data.orden_id}`;
    } catch (error) {
      setCheckoutLoading(false);
      showCheckoutMessage("No se pudo finalizar la compra.");
    }
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
      <Header
        cartCount={totalItems}
        userInitial={userInitial}
        userRole={userRole}
        onOpenCart={() => setIsCartOpen(true)}
      />

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

            {loadingProducts ? (
              <p className="mensaje">Cargando productos...</p>
            ) : productsMessage ? (
              <p className="mensaje mensaje-error">{productsMessage}</p>
            ) : (
              <div className="grid-productos">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}

            <p className="mensaje">{cartMessage}</p>
          </div>
        </section>

        <BenefitsSection />
        <NewsletterForm />
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        checkoutMessage={checkoutMessage}
        checkoutLoading={checkoutLoading}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onDelete={deleteProduct}
        onClear={clearCart}
        onCheckout={finalizePurchase}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}