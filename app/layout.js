import './globals.css';
export const metadata = {
  title: { default: 'EMAI | Educação para um mundo conectado', template: '%s | EMAI' },
  description: 'Educação Midiática e Aprendizagem Informacional. Um projeto de extensão da UFC para uma vida digital mais crítica, segura e consciente.',
  icons: { icon: '/favicon.svg' }
};
export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
