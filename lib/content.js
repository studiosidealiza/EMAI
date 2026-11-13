// Conteúdo inicial. Depois da configuração, o painel salva alterações no banco.
export const defaultContent = {
  heroTitle: 'Informação que transforma. Conhecimento que conecta.',
  heroDescription: 'Aprender a olhar, questionar e participar. Aproximamos a universidade e a comunidade para construir uma relação mais crítica, segura e consciente com o mundo digital.',
  about: 'O EMAI — Educação Midiática e Aprendizagem Informacional — é um projeto de extensão da Universidade Federal do Ceará, vinculado à Biblioteca da Faculdade de Economia, Administração, Atuária e Contabilidade Prof. Djacir Lima Menezes (BFEAAC).',
  mission: 'Apoiamos professores, educadores sociais e jovens na compreensão das mídias, no enfrentamento à desinformação e no exercício da cidadania digital.',
  contactEmail: 'studiosidealiza@gmail.com',
  githubUrl: '',
  githubBranch: 'main',
  menus: [
    { id: 'home', label: 'Início', href: '/', visible: true },
    { id: 'about', label: 'O projeto', href: '/#projeto', visible: true },
    { id: 'guide', label: 'Guia educativo', href: '/guia', visible: true },
    { id: 'forum', label: 'Fórum', href: '/forum', visible: true },
    { id: 'workshops', label: 'Oficinas', href: '/oficinas', visible: true }
  ]
};

// Redes oficiais: os ícones do rodapé utilizam estes endereços.
export const socialLinks = [
  { name: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/emai.ufc/' },
  { name: 'TikTok', icon: 'tiktok', href: 'https://www.tiktok.com/@emai.ufc?' }
];

export const chapters = [
  ['Por que educação midiática?', 'Um ponto de partida para compreender as mídias e participar com consciência.', 6],
  ['Desinformação e checagem', 'Como investigar fontes, reconhecer contextos e verificar antes de compartilhar.', 7],
  ['Direitos no ambiente digital', 'Moderação de conteúdo e direitos de quem ocupa as redes.', 12],
  ['Segurança online', 'Cuidados para proteger seus dados e reconhecer riscos na internet.', 15],
  ['Economia da atenção', 'Entenda por que é tão difícil se desconectar.', 25],
  ['Saúde mental e bem-estar', 'Uma relação mais equilibrada com o mundo digital.', 28],
  ['Cidadania digital', 'Participação ativa, respeito e responsabilidade nas redes.', 30],
  ['Inteligência artificial e algoritmos', 'Compreenda os mecanismos por trás do que aparece na sua tela.', 34],
  ['Produzir conteúdo com responsabilidade', 'Da leitura crítica à criação ética de conteúdo.', 37]
];

export function publicSettings(row) {
  return { ...defaultContent, ...(row?.content || {}) };
}
