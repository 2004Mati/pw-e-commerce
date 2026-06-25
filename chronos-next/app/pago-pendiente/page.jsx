"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PagoPendientePage() {
  const [externalReference, setExternalReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⏳</div>

          <p className="subtitulo">Pago en proceso</p>
          <h2>Tu pago está pendiente</h2>

          <p style={{ color: "#d2c9bb", marginTop: "16px" }}>
            El pago está siendo procesado. Las transferencias bancarias pueden
            tardar 1 a 2 días hábiles en confirmarse.
          </p>

          <p style={{ color: "#d2c9bb", marginTop: "12px" }}>
            Te notificaremos por email cuando el pago sea confirmado.
          </p>

          {externalReference && (
            <p style={{ color: "#d4af37", marginTop: "16px", fontWeight: "bold" }}>
              Referencia: {externalReference}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "28px" }}>
            <Link href="/mis-compras" className="boton" style={{ textAlign: "center" }}>
              Ver mis compras
            </Link>
            <Link href="/" className="boton-secundario" style={{ textAlign: "center" }}>
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
