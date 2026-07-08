# Base de datos — Chronos

Esquema, funciones y políticas de seguridad (RLS) de la base de datos en Supabase
(PostgreSQL), versionados junto al código.

## Archivos

| Archivo | Contenido |
|---|---|
| `01_schema.sql` | Tablas, tipo enum `estado_orden`, trigger de alta de perfil, funciones (`crear_orden_completa`) y políticas de RLS. |
| `02_procesar_pago_mp.sql` | Función `procesar_pago_mp`: refleja en la orden el resultado real de un pago de Mercado Pago. La usa el webhook. |

## Cómo aplicar

Ejecutar los archivos en orden en el **SQL Editor** de Supabase:

1. `01_schema.sql`
2. `02_procesar_pago_mp.sql`

Los scripts son idempotentes (`create ... if not exists`, `create or replace`,
`drop policy if exists`), así que se pueden volver a correr sin romper nada.

## Notas

- La confirmación de pagos ocurre **exclusivamente** en el webhook
  (`app/api/webhooks/mercado-pago`), que verifica cada pago contra la API de
  Mercado Pago antes de actualizar la orden.
- `procesar_pago_mp` es `SECURITY DEFINER` porque el webhook se ejecuta sin
  sesión de usuario (usa la anon key) y necesita actualizar la orden salteando RLS.
