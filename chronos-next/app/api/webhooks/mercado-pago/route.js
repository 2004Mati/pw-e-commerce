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

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== "approved") {
      return Response.json({ received: true }, { status: 200 });
    }

    const externalReference = paymentData.external_reference;

    if (!externalReference) {
      return Response.json({ received: true }, { status: 200 });
    }

    const { data, error } = await supabase.rpc("confirmar_pago_externo", {
      p_external_reference: externalReference,
      p_payment_id: String(paymentId)
    });

    if (error) {
      console.error("[Webhook MP] Error RPC:", error);
    } else {
      console.log("[Webhook MP] Orden actualizada:", data);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Webhook MP] Error:", err);
    return Response.json({ received: true }, { status: 200 });
  }
}
