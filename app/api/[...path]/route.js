import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publicData } from '@/lib/data';
import { defaultContent } from '@/lib/content';
import { AppError, text, uuid, settingsInput } from '@/lib/validation';
import { assertOrigin, session, requestCode, verifyCode, rateLimit, hash, SESSION_COOKIE } from '@/lib/auth';
import { createWorkshop, enroll, decide, notifyDecision } from '@/lib/workshops';
import { deliver } from '@/lib/mail';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 };

async function adminTransaction(request, callback) {
  return db().begin(async tx => {
    await tx`SELECT id FROM settings WHERE id=1 FOR UPDATE`;
    await session(request, tx);
    return callback(tx);
  });
}
async function handle(request, context) {
  try {
    const path = (await context.params).path.join('/');
    if (request.method === 'GET') {
      if (path === 'public') return reply(await publicData());
      if (path === 'admin') {
        await session(request);
        const sql = db();
        const [[settings], workshops, enrollments, posts, outbox] = await Promise.all([
          sql`SELECT admin_email,content FROM settings WHERE id=1`,
          sql`SELECT * FROM workshops ORDER BY created_at DESC LIMIT 1000`,
          sql`SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 10000`,
          sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT 1000`,
          sql`SELECT id,recipient,subject,status,attempts,created_at FROM outbox ORDER BY created_at DESC LIMIT 100`
        ]);
        return reply({ settings, workshops, enrollments, posts, outbox });
      }
      throw new AppError('Página não encontrada.', 404);
    }
    assertOrigin(request);
    if (!request.headers.get('content-type')?.includes('application/json')) throw new AppError('Envie os dados como JSON.', 415);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 40000) throw new AppError('O conteúdo enviado é muito grande.', 413);
    let data;
    try { data = JSON.parse(raw); } catch { throw new AppError('Dados inválidos.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new AppError('Dados inválidos.');
    const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') || 'unknown' : 'local';
    if (path === 'auth/request') {
      await rateLimit(`login:${hash(ip)}`, 5, 900);
      return reply(await requestCode('login'));
    }
    if (path === 'auth/verify') {
      await rateLimit(`verify:${hash(ip)}`, 30, 900);
      const token = await verifyCode(data, 'login');
      const response = reply({ message: 'Acesso autorizado.' });
      response.cookies.set(SESSION_COOKIE, token, cookieOptions);
      return response;
    }
    if (path === 'auth/logout') {
      const current = request.cookies.get(SESSION_COOKIE)?.value;
      if (current) await db()`DELETE FROM sessions WHERE token_hash=${hash(current)}`;
      const response = reply({ ok: true });
      response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
      return response;
    }
    if (path === 'workshops' || path === 'enroll') {
      await rateLimit(`forms:${hash(ip)}`, 20, 3600);
      if (data.website) throw new AppError('Não foi possível enviar o formulário.');
      return reply(path === 'workshops' ? await createWorkshop(data) : await enroll(data));
    }
    if (!path.startsWith('admin/')) throw new AppError('Página não encontrada.', 404);
    const admin = await session(request);
    if (path === 'admin/email/request') return reply(await requestCode('email', admin, data.email));
    if (path === 'admin/email/verify') {
      await verifyCode(data, 'email', admin);
      const response = reply({ message: 'E-mail alterado. Entre usando o novo endereço.' });
      response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
      return response;
    }
    if (path === 'admin/decision') {
      const mailId = await adminTransaction(request, tx => decide(tx, data));
      return reply(await notifyDecision(mailId));
    }
    if (path === 'admin/notify') {
      const result = await deliver(uuid(data.id));
      return reply({ message: result.sent ? 'E-mail enviado.' : result.message, warning: !result.sent });
    }
    return reply(await adminTransaction(request, async tx => {
      if (path === 'admin/settings') {
        const content = settingsInput(data, defaultContent);
        await tx`UPDATE settings SET content=${tx.json(content)} WHERE id=1`;
        return { message: 'Configurações salvas.' };
      }
      if (path === 'admin/post') {
        const id = uuid(data.id), title = text(data.title, 'Título', 160), category = text(data.category, 'Categoria', 40), body = text(data.body, 'Texto', 15000, 5);
        await tx`INSERT INTO posts (id,title,category,body,published) VALUES (${id},${title},${category},${body},${Boolean(data.published)})
          ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,body=EXCLUDED.body,published=EXCLUDED.published,updated_at=now()`;
        return { message: data.published ? 'Publicação salva no fórum.' : 'Rascunho salvo.' };
      }
      if (path === 'admin/post-delete') {
        await tx`DELETE FROM posts WHERE id=${uuid(data.id)}`;
        return { message: 'Publicação excluída.' };
      }
      if (path === 'admin/forum-reset') {
        if (data.confirmation !== 'APAGAR FÓRUM') throw new AppError('Digite APAGAR FÓRUM para confirmar.');
        await tx`DELETE FROM posts`;
        return { message: 'Todas as publicações e rascunhos foram excluídos.' };
      }
      throw new AppError('Página não encontrada.', 404);
    }));
  } catch (error) {
    if (!(error instanceof AppError)) console.error('Falha na operação EMAI:', error.code || error.name);
    return reply({ error: error instanceof AppError ? error.message : 'Não foi possível concluir. Tente novamente em alguns instantes.' }, error.status || 500);
  }
}
export const GET = handle;
export const POST = handle;
