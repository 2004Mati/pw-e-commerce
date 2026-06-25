"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PagoCompletadoPage() {
  const [paymentId, setPaymentId] = useState("");
  const [externalReference, setExternalReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPaymentId(params.get("payment_id") || "");
    setExternalReference(params.get("external_reference") || "");
  }, []);

  return (
    <>
      <header className="header">
        <div className="container header-contenido">
          <h1 className="logo">CHRONOS</h1>
          <nav className="nav" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/mis-compras">Mis compras</Link>
          </nav>
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-card" style={{ maxWidth: "600px", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✅</div>

          <p className="subtitulo">Pago exitoso</p>
          <h2>¡Tu pago fue aprobado!</h2>

          <p style={{ color: "#d2c9bb", marginTop: "16px" }}>
            Tu orden fue procesada correctamente. En breve recibirás la confirmación por email.
          </p>

          {paymentId && (
            <div
              style={{
                marginTop: "24px",
                padding: "18px",
                border: "1px solid #2a2a2a",
                borderRadius: "14px",
                background: "#101010",
                textAlign: "left"
              }}
            >
              {paymentId && (
                <p style={{ color: "#d2c9bb" }}>
                  ID de pago: <strong style={{ color: "#d4af37" }}>{paymentId}</strong>
                </p>
              )}
              {externalReference && (
                <p style={{ color: "#d2c9bb", marginTop: "8px" }}>
                  Referencia: <strong style={{ color: "#d4af37" }}>{externalReference}</strong>
                </p>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px" }}>
            <Link href="/mis-compras" className="boton" style={{ textAlign: "center" }}>
              Ver mis compras
            </Link>
            <Link href="/catalogo" className="boton-secundario" style={{ textAlign: "center" }}>
              Seguir comprando
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
