"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CheckoutPage() {
  const [orden, setOrden] = useState(null);
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    async function cargarOrden() {
      const params = new URLSearchParams(window.location.search);
      const ordenId = Number(params.get("orden_id"));

      if (!ordenId || Number.isNaN(ordenId)) {
        setMessage("No se recibió una orden válida para pagar.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/auth/login";
        return;
      }

      setSessionToken(session.access_token);

      try {
        const response = await fetch("/api/ordenes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setMessage(result.error || "No se pudo cargar la orden.");
          setMessageType("error");
          setLoading(false);
          return;
        }

        const ordenEncontrada = result.data.find(
          (item) => Number(item.id) === ordenId
        );

        if (!ordenEncontrada) {
          setMessage("No se encontró la orden solicitada.");
          setMessageType("error");
          setLoading(false);
          return;
        }

        setOrden(ordenEncontrada);
        setLoading(false);
      } catch (error) {
        setMessage("No se pudo cargar la orden.");
        setMessageType("error");
        setLoading(false);
      }
    }

    cargarOrden();
  }, []);

  async function prepararPago() {
    if (!orden || !sessionToken) return;

    setPaymentLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          orden_id: orden.id
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.error || "No se pudo preparar el pago.");
        setMessageType("error");
        setPaymentLoading(false);
        return;
      }

      const initPoint = result.data.init_point || result.data.sandbox_init_point;
      window.location.href = initPoint;
    } catch (error) {
      setMessage("No se pudo preparar el pago.");
      setMessageType("error");
      setPaymentLoading(false);
    }
  }

  async function confirmarPago() {
    if (!orden || !sessionToken) return;

    setConfirmLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/pagos/confirmar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          orden_id: orden.id
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.error || "No se pudo confirmar el pago.");
        setMessageType("error");
        setConfirmLoading(false);
        return;
      }

      setOrden((prevOrden) => ({
        ...prevOrden,
        ...result.data.orden
      }));

      setMessage("Pago confirmado correctamente. La orden ahora figura como pagada.");
      setMessageType("success");
      setConfirmLoading(false);
    } catch (error) {
      setMessage("No se pudo confirmar el pago.");
      setMessageType("error");
      setConfirmLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        <div className="container header-contenido">
          <h1 className="logo">CHRONOS</h1>

          <nav className="nav" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/mis-compras">Mis compras</Link>
            <Link href="/perfil">Mi perfil</Link>
          </nav>

          <div className="carrito-resumen">Checkout</div>
        </div>
      </header>

      <main className="auth-page">
        <section
          className="auth-card"
          style={{
            maxWidth: "900px"
          }}
        >
          <p className="subtitulo">Pago seguro</p>
          <h2>Checkout Chronos</h2>

          {loading ? (
            <p className="mensaje">Cargando orden...</p>
          ) : message && messageType === "error" && !orden ? (
            <>
              <p className="mensaje mensaje-error">{message}</p>
              <Link href="/" className="auth-volver">
                Volver al inicio
              </Link>
            </>
          ) : orden ? (
            <>
              <div
                style={{
                  marginTop: "28px",
                  padding: "22px",
                  border: "1px solid #2a2a2a",
                  borderRadius: "18px",
                  background: "#101010"
                }}
              >
                <h3 style={{ color: "#fff", marginBottom: "12px" }}>
                  Orden #{orden.id}
                </h3>

                <p style={{ color: "#d2c9bb" }}>
                  Estado:{" "}
                  <strong style={{ color: "#d4af37" }}>{orden.estado}</strong>
                </p>

                <p
                  style={{
                    color: "#d4af37",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    marginTop: "8px"
                  }}
                >
                  Total: USD {Number(orden.total)}
                </p>

                <p style={{ color: "#d2c9bb", marginTop: "8px" }}>
                  Fecha: {new Date(orden.creado_en).toLocaleString("es-AR")}
                </p>

                {orden.metodo_pago && (
                  <p style={{ color: "#d2c9bb", marginTop: "8px" }}>
                    Método de pago:{" "}
                    <strong style={{ color: "#d4af37" }}>
                      {orden.metodo_pago}
                    </strong>
                  </p>
                )}

                {orden.referencia_pago && (
                  <p style={{ color: "#d2c9bb", marginTop: "8px" }}>
                    Referencia:{" "}
                    <strong style={{ color: "#d4af37" }}>
                      {orden.referencia_pago}
                    </strong>
                  </p>
                )}

                {orden.pagado_en && (
                  <p style={{ color: "#d2c9bb", marginTop: "8px" }}>
                    Pagado el:{" "}
                    <strong style={{ color: "#d4af37" }}>
                      {new Date(orden.pagado_en).toLocaleString("es-AR")}
                    </strong>
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: "22px",
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
                      <h4 style={{ color: "#fff" }}>{item.producto?.nombre}</h4>
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

              {orden.estado === "pendiente" ? (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "22px",
                    border: "1px solid #2a2a2a",
                    borderRadius: "18px",
                    background: "#101010"
                  }}
                >
                  <h3 style={{ color: "#fff", marginBottom: "10px" }}>
                    Preparar pago
                  </h3>

                  <p style={{ color: "#d2c9bb" }}>
                    Vas a ser redirigido al checkout seguro de Mercado Pago para completar el pago.
                  </p>

                  <div style={{ marginTop: "18px" }}>
                    <button
                      type="button"
                      className="boton"
                      onClick={prepararPago}
                      disabled={paymentLoading}
                      style={{ width: "100%" }}
                    >
                      {paymentLoading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
                    </button>
                  </div>

                  {message && (
                    <p
                      className={`mensaje ${
                        messageType === "error"
                          ? "mensaje-error"
                          : messageType === "success"
                          ? "mensaje-exito"
                          : ""
                      }`}
                      style={{ marginTop: "18px" }}
                    >
                      {message}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "22px",
                    border: "1px solid #2a2a2a",
                    borderRadius: "18px",
                    background: "#101010"
                  }}
                >
                  <h3 style={{ color: "#fff", marginBottom: "10px" }}>
                    Pago confirmado
                  </h3>

                  <p className="mensaje mensaje-exito">
                    Esta orden ya fue pagada correctamente.
                  </p>
                </div>
              )}

              <Link href="/mis-compras" className="auth-volver">
                Volver a mis compras
              </Link>
            </>
          ) : null}
        </section>
      </main>
    </>
  );
}