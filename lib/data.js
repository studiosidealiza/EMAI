import { db } from './db.js';
import { publicSettings, defaultContent } from './content.js';
export async function publicData() {
  if (!process.env.DATABASE_URL) return { content: defaultContent, posts: [], workshops: [], available: false };
  const sql = db();
  const [[settings], posts, workshops] = await Promise.all([
    sql`SELECT content FROM settings WHERE id=1`,
    sql`SELECT id,title,category,body,created_at,updated_at FROM posts WHERE published=true ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT w.id,w.institution,w.location,w.starts_at,w.extra_seats,
      (w.extra_seats-count(e.id))::integer AS remaining FROM workshops w LEFT JOIN enrollments e ON e.workshop_id=w.id
      WHERE w.status='approved' AND w.starts_at > now() AND w.extra_seats>0
      GROUP BY w.id ORDER BY w.starts_at LIMIT 100`
  ]);
  return { content: publicSettings(settings), posts, workshops, available: true };
}
export async function pageData() {
  try { return JSON.parse(JSON.stringify(await publicData())); }
  catch { return { content: defaultContent, posts: [], workshops: [], available: false }; }
}
