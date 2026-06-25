export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("[Webhook MP]", JSON.stringify(body));
    return Response.json({ received: true }, { status: 200 });
  } catch {
    return Response.json({ received: true }, { status: 200 });
  }
}
