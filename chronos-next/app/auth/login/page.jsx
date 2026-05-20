"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedEmail, setLoggedEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setLoggedEmail(session.user.email);
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setLoggedEmail(session.user.email);
      } else {
        setLoggedEmail("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage("Error al iniciar sesión: " + error.message);
      setMessageType("error");
      return;
    }

    setMessage("Inicio de sesión correcto.");
    setMessageType("success");

    setTimeout(() => {
      router.push("/");
    }, 900);
  }

  async function handleLogout() {
    setMessage("");
    setMessageType("");
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    setLoading(false);

    if (error) {
      setMessage("Error al cerrar sesión: " + error.message);
      setMessageType("error");
      return;
    }

    setLoggedEmail("");
    setMessage("Sesión cerrada correctamente.");
    setMessageType("success");
  }

  const nick = loggedEmail ? loggedEmail.split("@")[0] : "";

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

          {loggedEmail ? (
            <Link href="/perfil" className="carrito-resumen">
              Mi perfil
            </Link>
          ) : (
            <div className="carrito-resumen">Cuenta</div>
          )}
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-card">
          {checkingSession ? (
            <p className="mensaje">Cargando sesión...</p>
          ) : loggedEmail ? (
            <>
              <p className="subtitulo">Cuenta activa</p>
              <h2>Ya iniciaste sesión</h2>

              <p className="auth-texto">
                Estás conectado como <strong>{nick}</strong>.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  flexWrap: "wrap",
                  marginTop: "28px"
                }}
              >
                <button
                  type="button"
                  className="boton"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>

                <Link href="/perfil" className="boton-secundario">
                  Mi perfil
                </Link>

                <Link href="/" className="auth-volver" style={{ marginTop: 0 }}>
                  Volver al inicio
                </Link>
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
                >
                  {message}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="subtitulo">Iniciar sesión</p>
              <h2>Entrá a Chronos</h2>

              <p className="auth-texto">
                Iniciá sesión para acceder a tu cuenta. Más adelante esta sesión
                se va a usar para asociar el carrito a tu usuario.
              </p>

              <form className="auth-form" onSubmit={handleLogin}>
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
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="boton" disabled={loading}>
                  {loading ? "Ingresando..." : "Iniciar sesión"}
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
                ¿No tenés cuenta?{" "}
                <Link href="/auth/register">Registrarte</Link>
              </p>

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