import Shell from '@/components/Shell';
import Icon from '@/components/Icon';
import { PageIntro } from '@/components/ui';
import { pageData } from '@/lib/data';
import { chapters } from '@/lib/content';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Guia educativo' };
export default async function Guide() {
  const {content}=await pageData();
  return <Shell content={content}><PageIntro eyebrow="BIBLIOTECA ABERTA" title="Conhecimento que acompanha você.">Um guia para ler, refletir e colocar em prática. Na sala de aula, em uma oficina ou no seu dia a dia.</PageIntro><section className="container section guide-page-grid"><aside className="guide-aside"><img className="guide-cover" src="/guia-capa.jpg" alt="Capa do guia de educação midiática"/><a className="button primary" href="/guia-emai.pdf" download><Icon name="download"/>Baixar guia completo</a><a className="text-link" href="/guia-emai.pdf" target="_blank" rel="noreferrer">Abrir PDF em outra aba <Icon name="diagonal" size={16}/></a><p>Autoria: Kleber Lima<br/>EMAI · BFEAAC · UFC<br/>Fortaleza, 2026 · PDF, 49 páginas</p></aside><div><div className="eyebrow"><span/>GUIA DE EDUCAÇÃO MIDIÁTICA</div><h2>Combate à desinformação<br/>e cidadania digital.</h2><p className="lead">Um material de apoio a professores, educadores sociais e jovens de 12 a 24 anos. Explicações, exemplos e atividades que podem ser adaptados a diferentes contextos educativos.</p><div className="chapter-list">{chapters.map(([title,description,page],index)=><details key={title}><summary><span className="chapter-number">{String(index+1).padStart(2,'0')}</span><h3>{title}</h3><Icon name="plus" size={18}/></summary><div className="chapter-body"><p>{description}</p><a href={`/guia-emai.pdf#page=${page}`} target="_blank" rel="noreferrer" className="text-link">Ler este capítulo <Icon name="diagonal" size={16}/></a></div></details>)}</div><div className="reading-note"><Icon name="book"/><p>O guia também inclui glossário, referências, leituras complementares e um modelo de pacto de convivência digital para a turma.</p></div></div></section></Shell>;
}
