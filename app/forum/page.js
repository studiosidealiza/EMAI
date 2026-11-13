import Shell from '@/components/Shell';
import Forum from '@/components/Forum';
import { PageIntro } from '@/components/ui';
import { pageData } from '@/lib/data';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Fórum' };
export default async function ForumPage() {
  const data=await pageData();
  return <Shell content={data.content}><PageIntro eyebrow="CONHECIMENTO EM CIRCULAÇÃO" title="Nosso ponto de encontro.">Notícias, materiais e registros compartilhados pela equipe EMAI. Um espaço para acompanhar o que estamos construindo juntos.</PageIntro><Forum posts={data.posts} available={data.available}/></Shell>;
}
