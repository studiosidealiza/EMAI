import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { AppError, workshopInput, text, email, uuid } from './validation.js';
import { deliver } from './mail.js';
export async function createWorkshop(data) {
  const row = workshopInput(data), sql = db();
  await sql`INSERT INTO workshops ${sql(row)} ON CONFLICT (id) DO NOTHING`;
  return { message: 'Solicitação recebida! A equipe analisará o pedido e responderá por e-mail.' };
}
export async function enroll(data) {
  if (!data.consent) throw new AppError('Confirme o uso dos dados para sua inscrição.');
  const id = uuid(data.id), workshopId = uuid(data.workshopId), name = text(data.name, 'Nome', 120), address = email(data.email);
  const sql = db();
  await sql.begin(async tx => {
    // A trava organiza inscrições simultâneas em uma fila para a mesma oficina.
    const [workshop] = await tx`SELECT * FROM workshops WHERE id=${workshopId} FOR UPDATE`;
    if (!workshop || workshop.status !== 'approved' || +workshop.starts_at <= Date.now()) throw new AppError('Esta oficina não está disponível para inscrição.', 409);
    const [existing] = await tx`SELECT id FROM enrollments WHERE workshop_id=${workshopId} AND email=${address}`;
    if (existing) throw new AppError('Este e-mail já está inscrito nesta oficina.', 409);
    const [{ total }] = await tx`SELECT count(*)::integer AS total FROM enrollments WHERE workshop_id=${workshopId}`;
    if (total >= workshop.extra_seats) throw new AppError('As vagas desta oficina acabaram. Escolha outra oficina.', 409);
    await tx`INSERT INTO enrollments (id,workshop_id,name,email) VALUES (${id},${workshopId},${name},${address})`;
  });
  return { message: 'Inscrição confirmada! Anote a data, o horário e o local da oficina.' };
}
export async function decide(tx, data) {
  const id = uuid(data.id), reason = text(data.reason, 'Justificativa', 2000, 5);
  if (!['approved','rejected'].includes(data.status)) throw new AppError('Decisão inválida.');
  const [workshop] = await tx`SELECT * FROM workshops WHERE id=${id} FOR UPDATE`;
  if (!workshop || workshop.status !== 'pending') throw new AppError('Esta solicitação já foi analisada ou não existe.', 409);
  if (data.status === 'approved' && +workshop.starts_at <= Date.now()) throw new AppError('Não é possível aprovar uma oficina cuja data já passou.');
  await tx`UPDATE workshops SET status=${data.status},reason=${reason},decided_at=now() WHERE id=${id}`;
  const mailId = randomUUID();
  const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Fortaleza' }).format(workshop.starts_at);
  const status = data.status === 'approved' ? 'aprovada' : 'não aprovada';
  await tx`INSERT INTO outbox (id,recipient,subject,body) VALUES (${mailId},${workshop.email},${`EMAI — solicitação ${status}`},
    ${`Olá!\n\nA solicitação de oficina para ${workshop.institution} foi ${status}.\nLocal: ${workshop.location}\nData: ${date} (horário de Fortaleza)\nParticipantes da instituição: ${workshop.people}\nVagas extras: ${workshop.extra_seats}\n\nJustificativa da equipe:\n${reason}\n\nEquipe EMAI`})`;
  return mailId;
}
export async function notifyDecision(mailId) {
  const result = await deliver(mailId);
  return { message: result.sent ? 'Decisão salva e e-mail enviado à instituição.' : result.message, warning: !result.sent };
}
