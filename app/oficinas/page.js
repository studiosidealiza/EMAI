import Shell from '@/components/Shell';
import Workshops from '@/components/Workshops';
import { PageIntro } from '@/components/ui';
import { pageData } from '@/lib/data';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Oficinas' };
export default async function WorkshopsPage() {
  const data=await pageData();
  return <Shell content={data.content}><PageIntro eyebrow="APRENDER É UM ENCONTRO" title="Novas ideias. Conexões reais.">Leve uma oficina do EMAI à sua instituição ou participe de um encontro com vagas abertas para a comunidade.</PageIntro><Workshops initialWorkshops={data.workshops} available={data.available}/></Shell>;
}
