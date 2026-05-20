"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage("Error al registrarse: " + error.message);
      setMessageType("error");
      return;
    }

    setMessage("Cuenta creada correctamente. Redirigiendo al login...");
    setMessageType("success");

    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1200);
  }

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

          <div className="carrito-resumen">Registro</div>
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-card">
          <p className="subtitulo">Crear cuenta</p>
          <h2>Registrate en Chronos</h2>

          <p className="auth-texto">
            Creá tu cuenta para acceder a Chronos Premium. Más adelante vamos a
            usar esta sesión para guardar el carrito en Supabase.
          </p>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="campo">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tuemail@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="boton" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          {message && (
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
          )}

          <p className="auth-link">
            ¿Ya tenés cuenta? <Link href="/auth/login">Iniciar sesión</Link>
          </p>

          <Link href="/" className="auth-volver">
            Volver al inicio
          </Link>
        </section>
      </main>
    </>
  );
}