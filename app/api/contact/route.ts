import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ ok: false, message: "Configuración incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const { name, email, msg } = body as { name?: string; email?: string; msg?: string };

  if (!name?.trim() || !email?.trim() || !msg?.trim()) {
    return Response.json({ ok: false, message: "Todos los campos son requeridos" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "jovanyagd@gmail.com",
    subject: `[Arcade Vault] Mensaje de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${msg}`,
  });

  if (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
