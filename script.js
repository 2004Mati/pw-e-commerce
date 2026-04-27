const botonesAgregar = document.querySelectorAll(".agregar-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");

const carritoContenido = document.getElementById("carrito-contenido");
const totalProductos = document.getElementById("total-productos");
const totalPrecio = document.getElementById("total-precio");
const botonVaciarCarrito = document.getElementById("vaciar-carrito");

const formulario = document.getElementById("form-suscripcion");
const inputEmail = document.getElementById("email");
const mensajeFormulario = document.getElementById("mensaje-formulario");

const carrito = {};

botonesAgregar.forEach((boton) => {
  boton.addEventListener("click", () => {
    const id = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    const precio = Number(boton.dataset.precio);

    if (carrito[id]) {
      carrito[id].cantidad += 1;
    } else {
      carrito[id] = {
        nombre: nombre,
        precio: precio,
        cantidad: 1
      };
    }

    renderizarCarrito();
    mostrarMensaje("Producto agregado al carrito.");
  });
});

botonVaciarCarrito.addEventListener("click", () => {
  for (const id in carrito) {
    delete carrito[id];
  }

  renderizarCarrito();
  mostrarMensaje("Carrito vaciado.");
});

function mostrarMensaje(texto) {
  mensajeCarrito.textContent = texto;

  setTimeout(() => {
    mensajeCarrito.textContent = "";
  }, 2000);
}

function renderizarCarrito() {
  carritoContenido.innerHTML = "";

  const ids = Object.keys(carrito);

  if (ids.length === 0) {
    carritoContenido.innerHTML = '<p class="carrito-vacio">Todavía no agregaste productos.</p>';
    contadorCarrito.textContent = "0";
    totalProductos.textContent = "0";
    totalPrecio.textContent = "USD 0";
    return;
  }

  let cantidadTotal = 0;
  let precioTotal = 0;

  ids.forEach((id) => {
    const producto = carrito[id];
    const subtotal = producto.precio * producto.cantidad;

    cantidadTotal += producto.cantidad;
    precioTotal += subtotal;

    const item = document.createElement("div");
    item.className = "item-carrito";

    item.innerHTML = `
      <div class="item-info">
        <h4>${producto.nombre}</h4>
        <p>USD ${producto.precio}</p>
      </div>

      <div class="item-cantidad">
        <button type="button" class="boton-cantidad disminuir" data-id="${id}">-</button>
        <span>${producto.cantidad}</span>
        <button type="button" class="boton-cantidad aumentar" data-id="${id}">+</button>
      </div>

      <div class="item-subtotal">
        USD ${subtotal}
      </div>

      <div>
        <button type="button" class="boton-eliminar" data-id="${id}">Eliminar</button>
      </div>
    `;

    carritoContenido.appendChild(item);
  });

  contadorCarrito.textContent = String(cantidadTotal);
  totalProductos.textContent = String(cantidadTotal);
  totalPrecio.textContent = `USD ${precioTotal}`;

  agregarEventosCarrito();
}

function agregarEventosCarrito() {
  const botonesAumentar = document.querySelectorAll(".aumentar");
  const botonesDisminuir = document.querySelectorAll(".disminuir");
  const botonesEliminar = document.querySelectorAll(".boton-eliminar");

  botonesAumentar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = boton.dataset.id;
      carrito[id].cantidad += 1;
      renderizarCarrito();
    });
  });

  botonesDisminuir.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = boton.dataset.id;
      carrito[id].cantidad -= 1;

      if (carrito[id].cantidad <= 0) {
        delete carrito[id];
      }

      renderizarCarrito();
    });
  });

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = boton.dataset.id;
      delete carrito[id];
      renderizarCarrito();
    });
  });
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const email = inputEmail.value.trim();

  if (email === "") {
    mensajeFormulario.textContent = "Por favor, ingresá un email.";
    mensajeFormulario.style.color = "#ff6b6b";
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    mensajeFormulario.textContent = "Ingresá un email válido.";
    mensajeFormulario.style.color = "#ff6b6b";
    return;
  }

  mensajeFormulario.textContent = "¡Gracias por suscribirte a Chronos Premium!";
  mensajeFormulario.style.color = "#d4af37";
  formulario.reset();
});

renderizarCarrito();