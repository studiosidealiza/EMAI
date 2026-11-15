import Logo from './Logo';

export default function LogoLoader() {
  return <div className="logo-loading-screen" role="status" aria-live="polite" aria-label="Carregando EMAI" aria-busy="true">
    <Logo loading decorative />
  </div>;
}
