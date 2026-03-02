import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios" });
  }

  try {
    await resend.emails.send({
      from: "Vila Olímpica <onboarding@resend.dev>",
      to: ["vilaolimpica@gmail.com"], // email da instituição
      subject: "Novo pedido de acesso - Morador",
      html: `
        <h3>Novo pedido de acesso</h3>
        <p><b>Nome:</b> ${nome}</p>
        <p><b>Email:</b> ${email}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
