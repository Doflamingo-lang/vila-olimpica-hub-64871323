import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const data = await resend.emails.send({
      from: "Vila Olímpica <onboarding@resend.dev>", // depois mudamos para teu domínio
      to: ["teuemail@gmail.com"], // troca para o email da instituição
      subject: "Teste de envio de email",
      html: "<p>Funcionou! Email enviado pelo site 🎉</p>",
    });

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
