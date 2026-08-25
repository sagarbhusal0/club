import nodemailer from "nodemailer";

export type EmailPayload = { to: string; subject: string; html: string; text?: string };

let transporter: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const t = getTransport();
  if (!t) {
    console.log("[email:mock]", payload.subject, "to", payload.to);
    return;
  }
  try {
    await t.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "ICT Mavi Imiliya Club"}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || payload.html.replace(/<[^>]+>/g, " "),
    });
    console.log("[email:sent]", payload.subject, "to", payload.to);
  } catch (e) {
    console.error("[email:failed]", payload.subject, "to", payload.to, e);
    throw e;
  }
}

export async function sendBulk(payloads: EmailPayload[], delayMs = 300) {
  let sent = 0, failed = 0;
  for (const p of payloads) {
    try { await sendEmail(p); sent++; } catch { failed++; }
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  }
  return { sent, failed };
}
