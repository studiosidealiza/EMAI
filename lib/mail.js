import { db } from './db.js';
import { AppError } from './validation.js';
export function requireMail() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new AppError('O envio de e-mails ainda não foi configurado.', 503);
}
export async function sendMail({ to, subject, body, id }) {
  requireMail();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': id },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text: body })
  });
  if (!response.ok) throw new AppError('Não foi possível enviar o e-mail. Tente novamente mais tarde.', 502);
}
// O registro permanece no banco caso o provedor de e-mail fique indisponível.
export async function deliver(id) {
  const sql = db();
  const [mail] = await sql`UPDATE outbox SET status='sending', attempts=attempts+1, attempted_at=now()
    WHERE id=${id} AND (status IN ('pending','failed') OR (status='sending' AND attempted_at < now()-interval '2 minutes')) RETURNING *`;
  if (!mail) return { sent: false, message: 'E-mail já enviado ou em processamento.' };
  try {
    await sendMail({ to: mail.recipient, subject: mail.subject, body: mail.body, id: `outbox-${mail.id}` });
    await sql`UPDATE outbox SET status='sent', sent_at=now() WHERE id=${id}`;
    return { sent: true };
  } catch {
    await sql`UPDATE outbox SET status='failed' WHERE id=${id}`;
    return { sent: false, message: 'Dados salvos. O e-mail não foi enviado; reenvie pelo painel administrativo.' };
  }
}
