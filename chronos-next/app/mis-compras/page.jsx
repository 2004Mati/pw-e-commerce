"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MisComprasPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCompras() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/auth/login";
        return;
      }

      try {
        const response = await fetch("/api/ordenes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setMessage(result.error || "No se pudieron cargar tus compras.");
          setLoading(false);
          return;
        }

        setOrdenes(result.data || []);
        setLoading(false);
      } catch (error) {
        setMessage("No se pudieron cargar tus compras.");
        setLoading(false);
      }
    }

    loadCompras();
  }, []);

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

          <div className="carrito-resumen">Compras</div>
        </div>
      </header>

      <main className="auth-page">
        <section
          className="auth-card"
          style={{
            maxWidth: "900px"
          }}
        >
          <h2>Mis compras</h2>

          {loading ? (
            <p className="mensaje">Cargando compras...</p>
          ) : message ? (
            <p className="mensaje mensaje-error">{message}</p>
          ) : ordenes.length === 0 ? (
            <p className="carrito-vacio">Todavía no tenés compras realizadas.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "22px",
                marginTop: "30px"
              }}
            >
              {ordenes.map((orden) => (
                <article
                  key={orden.id}
                  style={{
                    background: "#141414",
                    border: "1px solid #2a2a2a",
                    borderRadius: "18px",
                    padding: "22px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      marginBottom: "18px"
                    }}
                  >
                    <div>
                      <h3 style={{ color: "#fff", marginBottom: "6px" }}>
                        Orden #{orden.id}
                      </h3>

                      <p style={{ color: "#d2c9bb" }}>
                        Estado:{" "}
                        <strong style={{ color: "#d4af37" }}>
                          {orden.estado}
                        </strong>
                      </p>

                      {orden.estado === "pendiente" && (
                        <p
                          style={{
                            color: "#d2c9bb",
                            marginTop: "8px"
                          }}
                        >
                          Esta orden está pendiente de pago.
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "#d2c9bb" }}>
                        {new Date(orden.creado_en).toLocaleString("es-AR")}
                      </p>

                      <p
                        style={{
                          color: "#d4af37",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          marginTop: "6px"
                        }}
                      >
                        Total: USD {Number(orden.total)}
                      </p>

                      {orden.estado === "pendiente" && (
                        <Link
                          href={`/checkout?orden_id=${orden.id}`}
                          className="boton"
                          style={{
                            display: "inline-block",
                            marginTop: "14px",
                            padding: "12px 24px",
                            fontSize: "0.95rem"
                          }}
                        >
                          Pagar
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    {orden.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "70px 1fr auto",
                          gap: "14px",
                          alignItems: "center",
                          background: "#101010",
                          border: "1px solid #252525",
                          borderRadius: "14px",
                          padding: "12px"
                        }}
                      >
                        <img
                          src={item.producto?.imagen_url}
                          alt={`Reloj ${item.producto?.nombre}`}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "10px"
                          }}
                        />

                        <div>
                          <h4 style={{ color: "#fff" }}>
                            {item.producto?.nombre}
                          </h4>

                          <p style={{ color: "#d2c9bb" }}>
                            Cantidad: {item.cantidad} | Precio unitario: USD{" "}
                            {Number(item.precio_unitario)}
                          </p>
                        </div>

                        <strong style={{ color: "#d4af37" }}>
                          USD {Number(item.subtotal)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          <Link href="/" className="auth-volver">
            Volver al inicio
          </Link>
        </section>
      </main>
    </>
  );
}