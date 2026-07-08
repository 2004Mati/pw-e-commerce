import { createClient } from "@supabase/supabase-js";
import { client } from "../../../../lib/mercadopago";
import { Payment } from "mercadopago";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const paymentId = body?.data?.id || body?.id;
    const topic = body?.type || body?.topic;

    if (!paymentId || topic !== "payment") {
      return Response.json({ received: true }, { status: 200 });
    }

    // Verificamos el pago consultando la API de Mercado Pago.
    // Nunca confiamos en el estado que venga en el body de la notificación.
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    const externalReference = paymentData.external_reference;
    const status = paymentData.status;

    if (!externalReference || !status) {
      return Response.json({ received: true }, { status: 200 });
    }

    // Reflejamos el resultado real del pago en la orden:
    // approved -> pagada | rejected/cancelled -> cancelada | pending/in_process -> pendiente
    const { data, error } = await supabase.rpc("procesar_pago_mp", {
      p_external_reference: externalReference,
      p_payment_id: String(paymentId),
      p_status: status
    });

    if (error) {
      console.error("[Webhook MP] Error RPC:", error);
    } else {
      console.log(`[Webhook MP] Orden actualizada (status=${status}):`, data);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Webhook MP] Error:", err);
    return Response.json({ received: true }, { status: 200 });
  }
}
