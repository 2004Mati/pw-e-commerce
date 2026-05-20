"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PerfilPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    async function loadPerfil() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/auth/login";
        return;
      }

      const currentUser = session.user;

      setUserId(currentUser.id);
      setEmail(currentUser.email || "");

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        setMessage("No se pudo cargar el perfil.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (data) {
        setNombre(data.nombre || "");
        setApellido(data.apellido || "");
        setTelefono(data.telefono || "");
        setDireccion(data.direccion || "");
      }

      setLoading(false);
    }

    loadPerfil();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setMessageType("");

    const { error } = await supabase.from("usuarios").upsert({
      id: userId,
      email,
      nombre,
      apellido,
      telefono,
      direccion
    });

    setSaving(false);

    if (error) {
      setMessage("No se pudo guardar el perfil.");
      setMessageType("error");
      return;
    }

    setMessage("Perfil guardado correctamente.");
    setMessageType("success");
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

          <div className="carrito-resumen">Mi perfil</div>
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-card">
          <p className="subtitulo">Mi cuenta</p>
          <h2>Perfil de usuario</h2>

          {loading ? (
            <p className="mensaje">Cargando perfil...</p>
          ) : (
            <>
              <p className="auth-texto">
                Completá tus datos para asociar tus compras a tu perfil de
                cliente.
              </p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="campo">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={email} disabled />
                </div>

                <div className="campo">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    value={apellido}
                    onChange={(event) => setApellido(event.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    type="text"
                    placeholder="Tu teléfono"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    id="direccion"
                    type="text"
                    placeholder="Tu dirección"
                    value={direccion}
                    onChange={(event) => setDireccion(event.target.value)}
                  />
                </div>

                <button type="submit" className="boton" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar perfil"}
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