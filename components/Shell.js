'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { socialLinks } from '@/lib/content';
export default function Shell({ content, children }) {
  const path = usePathname(), [open, setOpen] = useState(false);
  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header"><div className="container nav-wrap">
      <Link href="/" className="brand" aria-label="EMAI — início"><img src="/logo.svg" alt="EMAI"/><span>Educação Midiática e<br/>Aprendizagem Informacional</span></Link>
      <button className="icon-button mobile-menu" onClick={()=>setOpen(!open)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}><Icon name={open?'close':'menu'}/></button>
      <nav aria-label="Menu principal" className={open?'navigation open':'navigation'}>
        {content.menus.filter(m=>m.visible).map(m=><Link key={m.id} href={m.href} onClick={()=>setOpen(false)} className={path === m.href ? 'active' : ''} aria-current={path===m.href?'page':undefined}>{m.label}</Link>)}
      </nav>
    </div></header>
    <main id="conteudo">{children}</main>
    <footer className="footer"><div className="container footer-main"><div><Link href="/" className="brand footer-brand"><img src="/logo.svg" alt="EMAI"/></Link><p>Educação para um mundo<br/>mais consciente e conectado.</p></div><div><span className="footer-label">UM PROJETO DE EXTENSÃO</span><p>Universidade Federal do Ceará<br/>Biblioteca da FEAAC<br/>Fortaleza, Ceará</p></div><div><span className="footer-label">VAMOS CONVERSAR</span><a href={`mailto:${content.contactEmail}`}>{content.contactEmail} <Icon name="diagonal" size={14}/></a><Link href="/oficinas">Leve o EMAI à sua instituição <Icon size={14}/></Link></div></div>
    <div className="container footer-social"><span>ACOMPANHE O EMAI</span><nav aria-label="Redes sociais do EMAI">{socialLinks.map(s=><a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} do EMAI (abre em nova aba)`} title={s.name}><Icon name={s.icon} size={20}/></a>)}</nav><span>@emai.ufc</span></div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} EMAI · UFC</span><div><Link href="/privacidade">Privacidade</Link><Link href="/admin">Área administrativa <Icon name="lock" size={12}/></Link></div></div></footer>
  </>;
}
