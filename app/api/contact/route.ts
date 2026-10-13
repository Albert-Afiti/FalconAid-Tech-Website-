const allowedTopics = new Set([
  "Partnership opportunity",
  "SmartAid Kit / product",
  "Safety and community work",
  "Technology collaboration",
  "Other inquiry",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maximumLength ? text : null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return Response.json({ error: "This request could not be accepted." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "This request could not be accepted." }, { status: 403 });
    }
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Send the form using the website." }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The submitted form data is invalid." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return Response.json({ error: "The submitted form data is invalid." }, { status: 400 });
  }

  const name = readText(body.name, 120);
  const email = readText(body.email, 254);
  const interest = readText(body.interest, 80);
  const message = readText(body.message, 5000);

  if (
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !interest ||
    !allowedTopics.has(interest) ||
    !message
  ) {
    return Response.json(
      { error: "Check that all fields are complete and the email address is valid." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_EMAIL || "falconaid.tech@gmail.com";

  if (!apiKey || !from) {
    console.error("Contact email delivery is not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL.");
    return Response.json(
      { error: "Email delivery is not configured yet. Please email falconaid.tech@gmail.com directly." },
      { status: 503 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeInterest = escapeHtml(interest);
  const safeMessage = escapeHtml(message);

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `FalconAid Tech website enquiry: ${interest}`,
        text: `Name: ${name}\nEmail: ${email}\nTopic: ${interest}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Topic:</strong> ${safeInterest}</p><p><strong>Message:</strong></p><p>${safeMessage.replace(/\r?\n/g, "<br>")}</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("Contact email provider request failed.", error);
    return Response.json(
      { error: "We couldn't send your message right now. Please try again or email falconaid.tech@gmail.com." },
      { status: 502 },
    );
  }

  if (!providerResponse.ok) {
    console.error(`Contact email provider returned HTTP ${providerResponse.status}.`);
    return Response.json(
      { error: "We couldn't send your message right now. Please try again or email falconaid.tech@gmail.com." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
