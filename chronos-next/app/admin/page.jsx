"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const ESTADOS = ["pendiente", "pagada", "confirmada", "enviada", "entregada", "cancelada"];

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("productos");

  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editValores, setEditValores] = useState({ precio: "", stock: "" });
  const [guardando, setGuardando] = useState(false);

  const [ordenes, setOrdenes] = useState([]);
  const [actualizandoOrden, setActualizandoOrden] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { window.location.href = "/auth/login"; return; }

      setToken(session.access_token);

      const rolRes = await fetch("/api/auth/rol", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const rolData = await rolRes.json();

      if (!rolRes.ok || rolData.data?.rol !== "admin") {
        setMessage("No tenés permisos para acceder al panel de administración.");
        setLoading(false);
        return;
      }

      setUsuario(rolData.data);
      await cargarProductos(session.access_token);
      await cargarOrdenes(session.access_token);
      setLoading(false);
    }
    init();
  }, []);

  async function cargarProductos(t) {
    const res = await fetch("/api/admin/productos", {
      headers: { Authorization: `Bearer ${t || token}` }
    });
    const data = await res.json();
    if (data.success) setProductos(data.data);
  }

  async function cargarOrdenes(t) {
    const res = await fetch("/api/admin/ordenes", {
      headers: { Authorization: `Bearer ${t || token}` }
    });
    const data = await res.json();
    if (data.success) setOrdenes(data.data);
  }

  function iniciarEdicion(p) {
    setEditando(p.id);
    setEditValores({ precio: p.precio, stock: p.stock });
  }

  async function guardarProducto(id) {
    setGuardando(true);
    const res = await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, precio: editValores.precio, stock: editValores.stock })
    });
    const data = await res.json();
    if (data.success) {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: Number(editValores.precio), stock: Number(editValores.stock) } : p));
      setEditando(null);
    }
    setGuardando(false);
  }

  async function cambiarEstadoOrden(id, estado) {
    setActualizandoOrden(id);
    const res = await fetch("/api/admin/ordenes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, estado })
    });
    const data = await res.json();
    if (data.success) {
      setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado } : o));
    }
    setActualizandoOrden(null);
  }

  const estiloCard = { background: "#101010", border: "1px solid #2a2a2a", borderRadius: "14px", padding: "16px", marginBottom: "12px" };
  const estiloInput = { background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "6px 10px", color: "#fff", width: "90px" };
  const estiloTab = (activa) => ({ padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", background: activa ? "#d4af37" : "#1a1a1a", color: activa ? "#000" : "#d2c9bb" });

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
          <div className="carrito-resumen">Admin</div>
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-card" style={{ maxWidth: "1000px" }}>
          <p className="subtitulo">Panel interno</p>
          <h2>Administración Chronos</h2>

          {loading ? (
            <p className="mensaje">Verificando permisos...</p>
          ) : message ? (
            <>
              <p className="mensaje mensaje-error">{message}</p>
              <Link href="/" className="auth-volver">Volver al inicio</Link>
            </>
          ) : (
            <>
              <p className="mensaje mensaje-exito">
                Bienvenido, <strong>{usuario?.email}</strong> — Rol: <strong>{usuario?.rol}</strong>
              </p>

              <div style={{ display: "flex", gap: "10px", margin: "24px 0 20px" }}>
                <button style={estiloTab(tab === "productos")} onClick={() => setTab("productos")}>
                  Productos ({productos.length})
                </button>
                <button style={estiloTab(tab === "ordenes")} onClick={() => setTab("ordenes")}>
                  Órdenes ({ordenes.length})
                </button>
              </div>

              {tab === "productos" && (
                <div>
                  <h3 style={{ color: "#fff", marginBottom: "16px" }}>Gestión de productos</h3>
                  {productos.map(p => (
                    <div key={p.id} style={estiloCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={p.imagen_url} alt={p.nombre} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                          <div>
                            <p style={{ color: "#fff", fontWeight: "bold" }}>{p.nombre}</p>
                            <p style={{ color: "#888", fontSize: "0.85rem" }}>{p.categoria}</p>
                          </div>
                        </div>

                        {editando === p.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <label style={{ color: "#d2c9bb", fontSize: "0.9rem" }}>
                              Precio: <input style={estiloInput} type="number" value={editValores.precio}
                                onChange={e => setEditValores(v => ({ ...v, precio: e.target.value }))} />
                            </label>
                            <label style={{ color: "#d2c9bb", fontSize: "0.9rem" }}>
                              Stock: <input style={estiloInput} type="number" value={editValores.stock}
                                onChange={e => setEditValores(v => ({ ...v, stock: e.target.value }))} />
                            </label>
                            <button className="boton" style={{ padding: "6px 16px" }} onClick={() => guardarProducto(p.id)} disabled={guardando}>
                              {guardando ? "..." : "Guardar"}
                            </button>
                            <button className="boton-secundario" style={{ padding: "6px 16px" }} onClick={() => setEditando(null)}>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <span style={{ color: "#d4af37" }}>USD {p.precio}</span>
                            <span style={{ color: p.stock <= 2 ? "#e74c3c" : "#d2c9bb" }}>Stock: {p.stock}</span>
                            <button className="boton-secundario" style={{ padding: "6px 16px" }} onClick={() => iniciarEdicion(p)}>
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "ordenes" && (
                <div>
                  <h3 style={{ color: "#fff", marginBottom: "16px" }}>Gestión de órdenes</h3>
                  {ordenes.map(o => (
                    <div key={o.id} style={estiloCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <p style={{ color: "#fff", fontWeight: "bold" }}>Orden #{o.id}</p>
                          <p style={{ color: "#888", fontSize: "0.85rem" }}>{o.usuarios?.email}</p>
                          <p style={{ color: "#d2c9bb", fontSize: "0.85rem" }}>
                            {new Date(o.creado_en).toLocaleString("es-AR")}
                          </p>
                          <p style={{ color: "#d4af37", fontWeight: "bold", marginTop: "4px" }}>
                            USD {Number(o.total)}
                          </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <select
                            value={o.estado}
                            onChange={e => cambiarEstadoOrden(o.id, e.target.value)}
                            disabled={actualizandoOrden === o.id}
                            style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", padding: "6px 10px", color: "#d4af37", cursor: "pointer" }}
                          >
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>

                          <div style={{ fontSize: "0.8rem", color: "#555" }}>
                            {o.orden_items?.map((item, i) => (
                              <span key={i}>{item.productos?.nombre} x{item.cantidad}{i < o.orden_items.length - 1 ? ", " : ""}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/" className="auth-volver">Volver al inicio</Link>
            </>
          )}
        </section>
      </main>
    </>
  );
}
