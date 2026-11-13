# EMAI
Site institucional do projeto Educação Midiática e Aprendizagem Informacional, da UFC.

React e Next.js, com HTML semântico, CSS próprio e JavaScript. Hospedagem prevista: Vercel. Persistência: PostgreSQL. E-mails: Resend.

## Começar
1. Instale Node.js 22.9 ou superior.
2. Abra esta pasta no editor e no terminal.
3. Execute `npm install`.
4. Execute `npm run dev` e abra http://localhost:3000.

Sem credenciais, as páginas institucionais e o guia funcionam; pedidos, login e inscrições não são simulados.

## Ativar os serviços
Copie `.env.example` para `.env.local`, preencha os valores e execute `npm run db:setup`. Consulte o [manual](docs/MANUAL-DO-ESTUDANTE.md) antes de publicar.
O administrador inicial é **studiosidealiza@gmail.com**. O remetente do serviço de e-mail precisa pertencer a um domínio verificado.

## Documentação
- [Manual passo a passo](docs/MANUAL-DO-ESTUDANTE.md)
- [Mapa de arquivos gerado](docs/MAPA-DE-ARQUIVOS.md)
- [Histórico de alterações](docs/ALTERACOES.md)

Antes de entregar uma alteração: atualize o manual, registre a mudança, execute `npm run docs:update` e `npm run check`.
Nunca inclua `.env.local`, dados de participantes ou chaves em commits.

## Escopo
Início, apresentação institucional, guia original em PDF, fórum editorial, solicitação de oficinas, inscrições em vagas extras, login por código, painel administrativo, decisões com justificativa e e-mail, edição de menus/conteúdo, troca verificada de e-mail e link de download do GitHub.

O fórum é um mural de publicações administrativas. Não há comentários públicos, contas de participantes ou pagamentos. O repositório GitHub e a hospedagem precisam ser conectados às contas da instituição.
