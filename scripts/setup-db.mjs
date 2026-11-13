import fs from 'node:fs/promises';
import postgres from 'postgres';
import { defaultContent } from '../lib/content.js';
import { email } from '../lib/validation.js';
if (!process.env.DATABASE_URL) throw new Error('Preencha DATABASE_URL em .env.local.');
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql.begin(async tx => {
    await tx.unsafe(await fs.readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'));
    await tx`INSERT INTO settings (id, admin_email, content) VALUES (1, ${email(process.env.ADMIN_EMAIL || 'studiosidealiza@gmail.com')}, ${tx.json(defaultContent)}) ON CONFLICT (id) DO NOTHING`;
  });
  console.log('Banco preparado. Dados existentes preservados.');
} finally { await sql.end(); }
