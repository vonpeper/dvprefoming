import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2026-02-25.acacia" as any,
      typescript: true,
    })
  : null;

export interface CreateCheckoutParams {
  programId: string;
  programName: string;
  amountMxn: number;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  type?: "SUBSCRIPTION" | "REGISTRATION";
  successUrl?: string;
  cancelUrl?: string;
}

export async function createStripeCheckoutSession(params: CreateCheckoutParams) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const successUrl = params.successUrl || `${origin}/pagos/exito?session_id={CHECKOUT_SESSION_ID}&program=${encodeURIComponent(params.programName)}`;
  const cancelUrl = params.cancelUrl || `${origin}/pagos/cancelado`;

  // If Stripe key is configured, create real Stripe Checkout session
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Mensualidad: ${params.programName}`,
              description: `Mensualidad de formación artística en DV Performing Arts para ${params.studentName || "el alumno"}.`,
              images: [`${origin}/images/brand/logo-badge.png`],
            },
            unit_amount: params.amountMxn * 100, // En centavos
            ...(params.type === "SUBSCRIPTION"
              ? {
                  recurring: {
                    interval: "month",
                  },
                }
              : {}),
          },
          quantity: 1,
        },
      ],
      mode: params.type === "SUBSCRIPTION" ? "subscription" : "payment",
      customer_email: params.studentEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        programId: params.programId,
        programName: params.programName,
        studentName: params.studentName || "",
        studentPhone: params.studentPhone || "",
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
      isLive: true,
    };
  }

  // Fallback demo/simulation mode for development
  return {
    url: `${origin}/pagos/exito?session_id=demo_stripe_${Date.now()}&program=${encodeURIComponent(params.programName)}&amount=${params.amountMxn}&student=${encodeURIComponent(params.studentName || "")}`,
    sessionId: `demo_session_${Date.now()}`,
    isLive: false,
  };
}
