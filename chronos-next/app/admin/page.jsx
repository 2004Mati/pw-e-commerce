"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verificarRol() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/auth/login";
        return;
      }

      try {
        const response = await fetch("/api/auth/rol", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setMessage(result.error || "No se pudo verificar tu rol.");
          setLoading(false);
          return;
        }

        if (result.data.rol !== "admin") {
          setMessage("No tenés permisos para acceder al panel de administración.");
          setLoading(false);
          return;
        }

        setUsuario(result.data);
        setLoading(false);
      } catch (error) {
        setMessage("Error al verificar permisos.");
        setLoading(false);
      }
    }

    verificarRol();
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
            <Link href="/perfil">Mi perfil</Link>
          </nav>

          <div className="carrito-resumen">Admin</div>
        </div>
      </header>

      <main className="auth-page">
        <section
          className="auth-card"
          style={{
            maxWidth: "900px"
          }}
        >
          <p className="subtitulo">Panel interno</p>
          <h2>Administración Chronos</h2>

          {loading ? (
            <p className="mensaje">Verificando permisos...</p>
          ) : message ? (
            <>
              <p className="mensaje mensaje-error">{message}</p>
              <Link href="/" className="auth-volver">
                Volver al inicio
              </Link>
            </>
          ) : (
            <>
              <p className="mensaje mensaje-exito">
                Acceso permitido. Estás ingresando como administrador.
              </p>

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
                  Usuario administrador
                </h3>

                <p style={{ color: "#d2c9bb" }}>
                  Email: <strong>{usuario?.email}</strong>
                </p>

                <p style={{ color: "#d4af37", marginTop: "8px" }}>
                  Rol: <strong>{usuario?.rol}</strong>
                </p>
              </div>

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
                  Gestión de productos
                </h3>

                <p style={{ color: "#d2c9bb" }}>
                  Próximo paso: acá vamos a agregar una mini gestión de productos
                  para crear, editar o eliminar relojes desde el panel admin.
                </p>
              </div>

              <Link href="/" className="auth-volver">
                Volver al inicio
              </Link>
            </>
          )}
        </section>
      </main>
    </>
  );
}