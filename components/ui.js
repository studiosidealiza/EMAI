'use client';
import { useState } from 'react';
import Icon from './Icon';
export async function api(path, data) {
  const response = await fetch(`/api/${path}`, data === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || 'Não foi possível concluir.'); error.status = response.status; throw error; }
  return result;
}
export function Notice({ message, error = false, warning = false }) {
  if (!message) return null;
  return <div className={`notice ${error?'error':warning?'warning':'success'}`} role={error?'alert':'status'}>{message}</div>;
}
export function Submit({ busy, children, ...props }) {
  return <button className="button primary" type="submit" disabled={busy} {...props}>{busy?'Aguarde…':children}{!busy&&<Icon name="arrow" size={17}/>}</button>;
}
export function Field({ label, as: Tag = 'input', children, hint, ...props }) {
  return <label className={`field ${props.type==='checkbox'?'check-field':''}`}><span>{label}{props.required&&<span className="required"> *</span>}</span><Tag {...props}>{children}</Tag>{hint&&<small>{hint}</small>}</label>;
}
export function Empty({ icon = 'calendar', title, children }) {
  return <div className="empty"><div className="empty-icon"><Icon name={icon} size={28}/></div><h3>{title}</h3><p>{children}</p></div>;
}
export function DateLabel({ value, full = false }) {
  const date = new Date(value);
  return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: full?'long':'medium', ...(full?{timeStyle:'short'}:{}), timeZone:'America/Fortaleza' }).format(date)}</time>;
}
export function PageIntro({ eyebrow, title, children }) {
  return <section className="page-intro"><div className="container"><div className="eyebrow"><span/>{eyebrow}</div><h1>{title}</h1><p>{children}</p></div></section>;
}
export function useFeedback() {
  const [busy,setBusy]=useState(false), [notice,setNotice]=useState({});
  async function run(task) {
    setBusy(true); setNotice({});
    try { const result = await task(); if(result?.message)setNotice(result); return result; }
    catch(error) { setNotice({ message:error.message,error:true }); return null; }
    finally { setBusy(false); }
  }
  return { busy,notice,run,setNotice };
}
