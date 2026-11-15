# Histórico de alterações
## 13/11/2026 — Primeira versão
- Identidade em azul-marinho, azul e branco; logo e guia fornecidos preservados.
- Páginas públicas, fórum editorial e formulários de oficinas.
- Painel com autenticação por código, decisões, publicações, menus e configurações.
- PostgreSQL para persistência e fila de reenvio de e-mails.
- Redes sociais oficiais no rodapé: Instagram e TikTok.
- Manual para estudantes, inventário e checagem de atualização documental.
- Testes de validação e integração com banco temporário; e-mails simulados somente nos testes.

## 13/11/2026 — Ajuste da navbar
- Oficinas passa a usar o mesmo estilo textual dos demais links.
- Removido O projeto da navegação e das configurações carregadas de versões anteriores.
- Documentação atualizada; seção institucional mantida na home.

## 13/11/2026 — Conexão local com PostgreSQL
- Configurado .env.local com conexão pooled do Neon e segredo de autenticação gerado localmente.
- Estrutura do banco preparada com db:setup. Credenciais ficam fora da documentação e do controle de versão.
- Serviço de envio de e-mails ainda depende de RESEND_API_KEY e EMAIL_FROM.

## 13/11/2026 — Ativação local do envio de códigos
- Configuradas RESEND_API_KEY e EMAIL_FROM em .env.local, sem registrar valores secretos na documentação.
- Testado envio de código administrativo pelo Resend.

## 13/11/2026 — Equipe no README
- Adicionadas cinco fotos circulares e os seis integrantes na ordem solicitada.
- Lucas incluído com inicial, sem foto. Imagens em docs/equipe/.

## 15/11/2026 — Remoção das faixas auxiliares
- Removida a faixa azul superior com o nome da universidade e o texto de extensão.
- Removida a faixa com Pensamento crítico, Segurança online, Cidadania digital e Conhecimento acessível.
- Removidos os estilos exclusivos e atualizada a documentação.

## 15/11/2026 — Logo animada e indicador de carregamento
- Criados Logo e LogoLoader a partir da nova Logo criada.
- Animação e aumento de 1% na Logo quando tem hover.
- Carregamento de rotas e da administração usa logo grande centralizada, vazada e com preenchimento ascendente.
