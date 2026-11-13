// Banco PostgreSQL temporário. Nenhum e-mail real é enviado por estes testes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { defaultContent } from '../lib/content.js';
import { db } from '../lib/db.js';
import { publicData } from '../lib/data.js';
import { createWorkshop, enroll, decide, notifyDecision } from '../lib/workshops.js';
import { requestCode, verifyCode, session, hash, rateLimit, assertOrigin } from '../lib/auth.js';
import { deliver } from '../lib/mail.js';

test('Fluxos completos com banco isolado', {timeout:120000}, async t=>{
  const memory=await PGlite.create();
  const server=new PGLiteSocketServer({db:memory,host:'127.0.0.1',port:55439,maxConnections:3});
  await server.start();
  process.env.DATABASE_URL='postgresql://postgres:postgres@'+server.getServerConn()+'/postgres';
  process.env.AUTH_SECRET='segredo-exclusivo-de-testes-com-mais-de-32-caracteres';
  process.env.RESEND_API_KEY='somente-teste';
  process.env.EMAIL_FROM='EMAI <teste@example.org>';
  process.env.APP_URL='http://localhost:3000';
  const sql=db(),originalFetch=globalThis.fetch,mails=[];
  let mailFailure=false;
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,'https://api.resend.com/emails');
    mails.push(JSON.parse(options.body));
    return new Response(JSON.stringify({id:'email-de-teste'}),{status:mailFailure?503:200});
  };
  try {
    await sql.unsafe(await fs.readFile(new URL('../database/schema.sql',import.meta.url),'utf8'));
    await sql`INSERT INTO settings (id,admin_email,content) VALUES (1,'admin@example.org',${sql.json(defaultContent)})`;
    let token;
    await t.test('Origem externa e acesso sem sessão são recusados',async()=>{
      assert.throws(()=>assertOrigin(new Request('http://localhost:3000/api/admin',{headers:{origin:'https://example.org'}})));
      assert.doesNotThrow(()=>assertOrigin(new Request('http://localhost:3000/api/admin',{headers:{origin:'http://localhost:3000'}})));
      await assert.rejects(session({cookies:{get:()=>undefined}}),e=>e.status===401);
    });
    await t.test('Código chega apenas ao administrador, é armazenado como hash e usado uma vez',async()=>{
      const result=await requestCode('login'),code=mails.at(-1).text.match(/\b\d{6}\b/)[0];
      assert.deepEqual(mails.at(-1).to,['admin@example.org']);
      const [challenge]=await sql`SELECT * FROM challenges WHERE id=${result.challengeId}`;
      assert.notEqual(challenge.digest,code);assert.equal(challenge.digest.length,64);
      token=await verifyCode({...result,code},'login');
      assert.equal(token.length,64);
      await assert.rejects(verifyCode({...result,code},'login'));
      await session({cookies:{get:()=>({value:token})}});
    });
    await t.test('Cinco erros bloqueiam o código mesmo com a resposta certa depois',async()=>{
      const result=await requestCode('login'),code=mails.at(-1).text.match(/\b\d{6}\b/)[0];
      for(let i=0;i<5;i++)await assert.rejects(verifyCode({...result,code:'000000'},'login'));
      await assert.rejects(verifyCode({...result,code},'login'));
      const [row]=await sql`SELECT attempts FROM challenges WHERE id=${result.challengeId}`;
      assert.equal(row.attempts,5);
    });
    await t.test('Código vencido não permite entrar',async()=>{
      const result=await requestCode('login'),code=mails.at(-1).text.match(/\b\d{6}\b/)[0];
      await sql`UPDATE challenges SET expires_at=now()-interval '1 second' WHERE id=${result.challengeId}`;
      await assert.rejects(verifyCode({...result,code},'login'));
    });
    const date=new Date(Date.now()+86400000*30).toISOString().slice(0,10),id=randomUUID();
    await t.test('Solicitação é persistida como pendente e fica fora da lista pública',async()=>{
      const data={id,institution:'Escola de teste',location:'Local de teste',date,time:'14:30',people:20,extraSeats:1,email:'escola@example.org',consent:true};
      await createWorkshop(data);await createWorkshop(data);
      const rows=await sql`SELECT * FROM workshops`;assert.equal(rows.length,1);assert.equal(rows[0].status,'pending');
      assert.equal((await publicData()).workshops.length,0);
      await assert.rejects(enroll({id:randomUUID(),workshopId:id,name:'Teste',email:'teste@example.org',consent:true}));
    });
    await t.test('Aprovação mantém a decisão mesmo se o e-mail falhar e permite reenvio',async()=>{
      const mailId=await sql.begin(tx=>decide(tx,{id,status:'approved',reason:'Data disponível para a equipe.'}));
      mailFailure=true;const result=await notifyDecision(mailId);assert.equal(result.warning,true);
      const [pending]=await sql`SELECT status FROM outbox WHERE id=${mailId}`;assert.equal(pending.status,'failed');
      mailFailure=false;assert.equal((await deliver(mailId)).sent,true);
      const [sent]=await sql`SELECT status FROM outbox WHERE id=${mailId}`;assert.equal(sent.status,'sent');
      assert.match(mails.at(-1).text,/Data disponível/);assert.deepEqual(mails.at(-1).to,['escola@example.org']);
      await assert.rejects(sql.begin(tx=>decide(tx,{id,status:'rejected',reason:'Outra decisão indevida.'})));
    });
    await t.test('Última vaga é protegida contra duas inscrições simultâneas',async()=>{
      const results=await Promise.allSettled(['um','dois'].map(name=>enroll({id:randomUUID(),workshopId:id,name:`Pessoa ${name}`,email:`${name}@example.org`,consent:true})));
      assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
      const [{count}]=await sql`SELECT count(*)::integer AS count FROM enrollments WHERE workshop_id=${id}`;assert.equal(count,1);
      const data=await publicData();assert.equal(data.workshops[0].remaining,0);
      assert.equal('email' in data.workshops[0],false);assert.equal('admin_email' in data.content,false);
    });
    await t.test('Oficina negada não é publicada e envia justificativa',async()=>{
      const second=randomUUID();await createWorkshop({id:second,institution:'Outra escola',location:'Outro local',date,time:'10:00',people:10,extraSeats:2,email:'outra@example.org',consent:true});
      const mailId=await sql.begin(tx=>decide(tx,{id:second,status:'rejected',reason:'A equipe não tem disponibilidade nesta data.'}));
      await notifyDecision(mailId);assert.match(mails.at(-1).text,/não aprovada/);
      assert.equal((await publicData()).workshops.some(w=>w.id===second),false);
    });
    await t.test('Troca de e-mail exige código novo e invalida a sessão anterior',async()=>{
      const admin=await session({cookies:{get:()=>({value:token})}});
      const result=await requestCode('email',admin,'novo@example.org');const code=mails.at(-1).text.match(/\b\d{6}\b/)[0];
      assert.deepEqual(mails.at(-1).to,['novo@example.org']);
      await assert.rejects(verifyCode({...result,code},'email',{token_hash:hash('outro-token')}));
      await verifyCode({...result,code},'email',admin);
      await assert.rejects(session({cookies:{get:()=>({value:token})}}),e=>e.status===401);
      const [settings]=await sql`SELECT admin_email FROM settings`;assert.equal(settings.admin_email,'novo@example.org');
    });
    await t.test('Limite de solicitações fica persistido no banco',async()=>{
      await rateLimit('teste-limite',2,60);await rateLimit('teste-limite',2,60);
      await assert.rejects(rateLimit('teste-limite',2,60),e=>e.status===429);
    });
  } finally {
    globalThis.fetch=originalFetch;
    await sql.end({timeout:2});await server.stop();await memory.close();
  }
});
