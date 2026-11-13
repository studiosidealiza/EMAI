import postgres from 'postgres';
import { AppError } from './validation.js';
let connection;
export function db() {
  if (!process.env.DATABASE_URL) throw new AppError('O serviço está em configuração. Tente novamente mais tarde.', 503);
  // Uma conexão pequena por instância funciona com o pooler do provedor na Vercel.
  connection ||= postgres(process.env.DATABASE_URL, { max: 3, prepare: false, idle_timeout: 20, connect_timeout: 10 });
  return connection;
}
