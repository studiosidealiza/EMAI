export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function text(value, label, max = 200, min = 2) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new AppError(`${label}: preencha entre ${min} e ${max} caracteres.`);
  return value.trim();
}
export function email(value) {
  const result = text(value, 'E-mail', 254, 5).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new AppError('Informe um e-mail válido.');
  return result;
}
export function integer(value, label, min, max) {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') throw new AppError(`${label}: informe um número.`);
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new AppError(`${label}: use um número entre ${min} e ${max}.`);
  return n;
}
export function uuid(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)) throw new AppError('Identificador inválido.');
  return value;
}
export function workshopInput(data, now = Date.now()) {
  if (!data.consent) throw new AppError('Confirme o uso dos dados para organizar a oficina.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time || '')) throw new AppError('Informe data e horário válidos.');
  const starts = new Date(`${data.date}T${data.time}:00-03:00`);
  if (!Number.isFinite(+starts)) throw new AppError('Data inválida.');
  const calendar = new Date(`${data.date}T12:00:00Z`);
  if (!Number.isFinite(+calendar) || calendar.toISOString().slice(0,10) !== data.date) throw new AppError('Data inválida.');
  if (+starts <= now || +starts > now + 730 * 86400000) throw new AppError('Escolha uma data futura, nos próximos dois anos.');
  return {
    id: uuid(data.id), institution: text(data.institution, 'Instituição', 160),
    location: text(data.location, 'Local', 300), starts_at: starts.toISOString(),
    people: integer(data.people, 'Número de pessoas', 1, 1000),
    extra_seats: integer(data.extraSeats, 'Vagas extras', 0, 500), email: email(data.email)
  };
}
export function settingsInput(data, defaults) {
  const menus = data.menus;
  if (!Array.isArray(menus) || menus.length !== defaults.menus.length) throw new AppError('Lista de menus inválida.');
  const ids = new Set();
  const clean = menus.map(item => {
    const original = defaults.menus.find(m => m.id === item.id);
    if (!original || ids.has(item.id)) throw new AppError('Menu inválido ou repetido.');
    ids.add(item.id);
    return { id: original.id, href: original.href, label: text(item.label, 'Nome do menu', 30), visible: Boolean(item.visible) };
  });
  if (!clean.some(m => m.visible)) throw new AppError('Mantenha pelo menos um menu visível.');
  const githubUrl = (data.githubUrl || '').trim().replace(/\/$/, '');
  if (githubUrl && !/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(githubUrl)) throw new AppError('Use o endereço completo de um repositório no GitHub.');
  const githubBranch = text(data.githubBranch || 'main', 'Branch', 100, 1);
  if (!/^[a-zA-Z0-9_./-]+$/.test(githubBranch) || githubBranch.includes('..')) throw new AppError('Branch inválida.');
  return { heroTitle: text(data.heroTitle, 'Título', 150), heroDescription: text(data.heroDescription, 'Apresentação', 800),
    about: text(data.about, 'Sobre', 2000), mission: text(data.mission, 'Missão', 1000),
    contactEmail: email(data.contactEmail), githubUrl, githubBranch, menus: clean };
}
