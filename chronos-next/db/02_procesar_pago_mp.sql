-- ============================================================================
-- procesar_pago_mp
-- ============================================================================
-- Actualiza el estado de una orden según el resultado REAL de un pago de
-- Mercado Pago. La invoca el webhook (app/api/webhooks/mercado-pago/route.js)
-- DESPUÉS de verificar el pago consultando la API de Mercado Pago (nunca se
-- confía en el body de la notificación).
--
-- Reemplaza a la antigua confirmar_pago_externo, que solo contemplaba pagos
-- aprobados. Ahora se refleja cualquier resultado:
--    approved                                      -> pagada
--    rejected / cancelled / refunded / charged_back -> cancelada
--    pending / in_process / otros                  -> pendiente
--
-- El UPDATE solo aplica si la orden sigue 'pendiente', de modo que un webhook
-- duplicado o tardío no pueda pisar una orden ya finalizada (p. ej. cancelar
-- una que ya estaba pagada).
--
-- SECURITY DEFINER: el webhook usa la anon key (sin sesión de usuario), por lo
-- que la función corre con los permisos del owner para poder actualizar la
-- orden salteando las políticas de RLS.
-- ============================================================================

create or replace function public.procesar_pago_mp(
  p_external_reference text,
  p_payment_id text,
  p_status text
)
returns table(success boolean, nuevo_estado text, error_msg text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orden_id bigint;
  v_estado   text;
begin
  -- external_reference tiene el formato 'orden_<id>'; extraemos solo los dígitos.
  v_orden_id := nullif(regexp_replace(p_external_reference, '\D', '', 'g'), '')::bigint;

  if v_orden_id is null then
    return query select false, null::text, 'external_reference inválido'::text;
    return;
  end if;

  -- Mapeo del estado de Mercado Pago al estado interno de la orden.
  v_estado := case
    when p_status = 'approved' then 'pagada'
    when p_status in ('rejected', 'cancelled', 'refunded', 'charged_back') then 'cancelada'
    else 'pendiente'
  end;

  update ordenes
  set estado          = v_estado,
      referencia_pago = case when v_estado = 'pagada' then p_payment_id else referencia_pago end,
      pagado_en       = case when v_estado = 'pagada' then now() else pagado_en end
  where id = v_orden_id
    and estado = 'pendiente';

  if found then
    return query select true, v_estado, null::text;
  else
    return query select false, v_estado, 'Orden no encontrada o ya procesada'::text;
  end if;

exception when others then
  return query select false, null::text, sqlerrm;
end;
$$;

-- La función anterior quedó obsoleta. Descomentar para eliminarla:
-- drop function if exists public.confirmar_pago_externo(text, text);
