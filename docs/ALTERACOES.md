# Histórico de alterações
## 2026-11-13 — Primeira versão
- Identidade em azul-marinho, azul e branco; logo e guia fornecidos preservados.
- Páginas públicas, fórum editorial e formulários de oficinas.
- Painel com autenticação por código, decisões, publicações, menus e configurações.
- PostgreSQL para persistência e fila de reenvio de e-mails.
- Redes sociais oficiais no rodapé: Instagram e TikTok.
- Manual para estudantes, inventário e checagem de atualização documental.
- Testes de validação e integração com banco temporário; e-mails simulados somente nos testes.

## 2026-11-13 — Revisão da documentação
- Manual reescrito com tom técnico e linguagem direta.
- Removidas analogias infantis e instruções elementares.
- Detalhadas as responsabilidades dos componentes, utilitários, propriedades de conteúdo e camadas da aplicação.

## 2026-11-13 — Ajuste da navbar
- Oficinas passa a usar o mesmo estilo textual dos demais links.
- Removido O projeto da navegação e das configurações carregadas de versões anteriores.
- Documentação atualizada; seção institucional mantida na home.

## 2026-11-13 — Conexão local com PostgreSQL
- Configurado .env.local com conexão pooled do Neon e segredo de autenticação gerado localmente.
- Estrutura do banco preparada com db:setup. Credenciais ficam fora da documentação e do controle de versão.
- Serviço de envio de e-mails ainda depende de RESEND_API_KEY e EMAIL_FROM.

## 2026-11-13 — Ativação local do envio de códigos
- Configuradas RESEND_API_KEY e EMAIL_FROM em .env.local, sem registrar valores secretos na documentação.
- Testado envio de código administrativo pelo Resend; desafio de teste removido após o envio.
- Remetente de testes onboarding@resend.dev; envios para outros destinatários exigem domínio verificado.

## 2026-11-13 — Equipe no README
- Adicionadas cinco fotos circulares e os seis integrantes na ordem solicitada.
- Lucas incluído com inicial, sem foto. Imagens em docs/equipe/.

## 2026-11-15 — Remoção das faixas auxiliares
- Removida a faixa azul superior com o nome da universidade e o texto de extensão.
- Removida a faixa com Pensamento crítico, Segurança online, Cidadania digital e Conhecimento acessível.
- Removidos os estilos exclusivos e atualizada a documentação.
