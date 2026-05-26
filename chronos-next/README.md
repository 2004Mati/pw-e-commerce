# Chronos Premium

Chronos Premium es un e-commerce académico de relojes premium desarrollado para la materia Programación Web.

El proyecto simula una tienda online con catálogo de productos, autenticación de usuarios, carrito persistente, órdenes de compra e historial de compras usando Next.js y Supabase.

## URL pública

https://pw-e-commerce-orcin.vercel.app

## Tecnologías utilizadas

- Next.js
- React
- JavaScript
- CSS
- Supabase
- PostgreSQL
- Supabase Auth
- GitHub
- Vercel

## Funcionalidades principales

### Landing page

La página principal presenta la marca Chronos, una colección de relojes premium, beneficios comerciales y un formulario de contacto/suscripción.

### Catálogo de productos

Los productos se cargan desde Supabase, usando una tabla `productos`.

Cada producto incluye:

- nombre
- descripción
- precio
- stock
- imagen
- categoría

### Autenticación

El proyecto incluye autenticación con Supabase Auth:

- registro de usuario
- inicio de sesión
- cierre de sesión
- detección de sesión activa

Si el usuario está logueado, se muestra su inicial en el header.

### Perfil de usuario

Cada usuario puede completar datos de perfil:

- nombre
- apellido
- teléfono
- dirección

Estos datos se guardan en la tabla `usuarios`, vinculada al usuario autenticado de Supabase.

### Carrito persistente

El carrito está asociado al usuario autenticado.

Permite:

- agregar productos
- aumentar cantidad
- disminuir cantidad
- eliminar productos
- vaciar carrito
- conservar el carrito aunque se recargue la página

La información se guarda en la tabla `carrito`.

### Finalización de compra

El usuario puede finalizar la compra desde el panel lateral del carrito.

Al finalizar:

- se crea una orden en la tabla `ordenes`
- se guardan los productos comprados en `orden_items`
- se vacía el carrito
- se muestra un mensaje de confirmación

### Mis compras

La ruta `/mis-compras` muestra el historial de compras del usuario autenticado.

Cada usuario solo puede ver sus propias órdenes.

## Tablas principales en Supabase

### productos

Guarda los relojes disponibles en el catálogo.

### carrito

Guarda los productos agregados al carrito por cada usuario.

### ordenes

Guarda cada compra finalizada.

### orden_items

Guarda los productos incluidos en cada orden.

### usuarios

Guarda datos adicionales del perfil del usuario.

## Seguridad

El proyecto usa Row Level Security en Supabase para proteger los datos de cada usuario.

Cada usuario solo puede acceder a:

- su propio carrito
- sus propias órdenes
- sus propios datos de perfil

## Variables de entorno

Para correr el proyecto se necesitan las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=