import { createHash, createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';
import { AppError, email, uuid } from './validation.js';
import { sendMail, requireMail } from './mail.js';
export const SESSION_COOKIE = 'emai_session';
export const hash = value => createHash('sha256').update(value).digest('hex');
function secret() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new AppError('O acesso administrativo ainda não foi configurado.', 503);
  return process.env.AUTH_SECRET;
}
const digest = (id, code) => createHmac('sha256', secret()).update(`${id}:${code}`).digest('hex');
export function assertOrigin(request) {
  const expected = process.env.APP_URL || (process.env.NODE_ENV !== 'production' ? new URL(request.url).origin : null);
  if (!expected || request.headers.get('origin') !== new URL(expected).origin) throw new AppError('Origem da solicitação não autorizada.', 403);
}
export async function rateLimit(key, limit, seconds) {
  const sql = db();
  const [row] = await sql`INSERT INTO rate_limits (key,count,expires_at) VALUES (${key},1,now()+${seconds}*interval '1 second')
    ON CONFLICT (key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at < now() THEN 1 ELSE rate_limits.count+1 END,
    expires_at=CASE WHEN rate_limits.expires_at < now() THEN EXCLUDED.expires_at ELSE rate_limits.expires_at END RETURNING count`;
  if (row.count > limit) throw new AppError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.', 429);
}
export async function session(request, sql = db()) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new AppError('Entre novamente para continuar.', 401);
  const [row] = await sql`SELECT s.token_hash, s.auth_version FROM sessions s JOIN settings c ON c.id=1 AND c.auth_version=s.auth_version
    WHERE s.token_hash=${hash(token)} AND s.expires_at > now()`;
  if (!row) throw new AppError('Sua sessão expirou. Entre novamente.', 401);
  return row;
}
export async function requestCode(purpose, adminSession, newEmail) {
  secret(); requireMail();
  const sql = db();
  const [settings] = await sql`SELECT * FROM settings WHERE id=1`;
  if (!settings) throw new AppError('Execute a preparação do banco antes de entrar.', 503);
  const address = purpose === 'email' ? email(newEmail) : settings.admin_email;
  if (purpose === 'email' && address === settings.admin_email) throw new AppError('Esse já é o e-mail administrativo.');
  await rateLimit(`mail:${hash(address)}`, 5, 900);
  const id = randomUUID(), code = String(randomInt(100000, 1000000));
  await sql`DELETE FROM challenges WHERE expires_at < now()`;
  await sql`INSERT INTO challenges (id,email,digest,purpose,session_hash,auth_version,expires_at)
    VALUES (${id},${address},${digest(id,code)},${purpose},${adminSession?.token_hash || null},${settings.auth_version},now()+interval '10 minutes')`;
  try {
    await sendMail({ to: address, subject: purpose === 'email' ? 'EMAI — confirme o novo e-mail' : 'EMAI — seu código de acesso',
      body: `Seu código é ${code}.\n\nEle expira em 10 minutos e só pode ser utilizado uma vez. Não compartilhe este código.\nSe você não solicitou este acesso, ignore a mensagem.`, id: `otp-${id}` });
  } catch (error) { await sql`DELETE FROM challenges WHERE id=${id}`; throw error; }
  return { challengeId: id, message: 'Código enviado. Verifique a caixa de entrada e o spam.' };
}
export async function verifyCode(data, purpose, adminSession) {
  const id = uuid(data.challengeId);
  if (!/^\d{6}$/.test(data.code || '')) throw new AppError('Digite os seis números do código.');
  const sql = db(), token = randomBytes(32).toString('hex');
  // Retornamos erros de dentro da transação para não desfazer o contador de tentativas.
  const result = await sql.begin(async tx => {
    const [settings] = await tx`SELECT * FROM settings WHERE id=1 FOR UPDATE`;
    const [challenge] = await tx`SELECT * FROM challenges WHERE id=${id} FOR UPDATE`;
    if (!challenge || challenge.purpose !== purpose || +challenge.expires_at <= Date.now() || challenge.attempts >= 5 || challenge.auth_version !== settings.auth_version)
      return { error: 'Código inválido ou expirado. Solicite outro.' };
    if (purpose === 'email' && challenge.session_hash !== adminSession?.token_hash) return { error: 'Solicite a troca de e-mail novamente nesta sessão.' };
    await tx`UPDATE challenges SET attempts=attempts+1 WHERE id=${id}`;
    if (!timingSafeEqual(Buffer.from(challenge.digest,'hex'), Buffer.from(digest(id,data.code),'hex'))) return { error: 'Código incorreto. Confira os seis números recebidos.' };
    await tx`DELETE FROM challenges WHERE id=${id}`;
    if (purpose === 'email') {
      await tx`UPDATE settings SET admin_email=${challenge.email}, auth_version=auth_version+1 WHERE id=1`;
      await tx`DELETE FROM sessions`;
      await tx`DELETE FROM challenges`;
    } else {
      await tx`DELETE FROM sessions WHERE expires_at < now()`;
      await tx`INSERT INTO sessions (token_hash,auth_version,expires_at) VALUES (${hash(token)},${settings.auth_version},now()+interval '8 hours')`;
    }
    return { ok: true };
  });
  if (result.error) throw new AppError(result.error, 400);
  return purpose === 'login' ? token : null;
}
