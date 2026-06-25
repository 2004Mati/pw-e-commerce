"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PagoFallidoPage() {
  const [externalReference, setExternalReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setExternalReference(params.get("external_reference") || "");
  }, []);

  const ordenId = externalReference?.replace("orden_", "");

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
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>❌</div>

          <p className="subtitulo">Pago rechazado</p>
          <h2>El pago no pudo procesarse</h2>

          <p style={{ color: "#d2c9bb", marginTop: "16px" }}>
            El pago fue rechazado. Posibles razones:
          </p>

          <ul
            style={{
              color: "#d2c9bb",
              textAlign: "left",
              marginTop: "12px",
              paddingLeft: "20px",
              lineHeight: "2"
            }}
          >
            <li>Fondos insuficientes</li>
            <li>Tarjeta rechazada por el banco</li>
            <li>Datos de la tarjeta incorrectos</li>
            <li>Cancelación manual del pago</li>
          </ul>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px" }}>
            {ordenId && (
              <Link
                href={`/checkout?orden_id=${ordenId}`}
                className="boton"
                style={{ textAlign: "center" }}
              >
                Reintentar pago
              </Link>
            )}
            <Link href="/mis-compras" className="boton-secundario" style={{ textAlign: "center" }}>
              Ver mis compras
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
