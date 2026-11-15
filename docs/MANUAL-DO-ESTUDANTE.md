# Documentação técnica — site EMAI
Atualizada em 13 de novembro de 2026.

Referência para estudantes responsáveis por compreender, modificar e manter o site. O documento apresenta a função de cada arquivo, o caminho dos dados e os pontos que precisam ser atualizados em conjunto.

## 1. Arquitetura e tecnologias

O projeto usa React com Next.js. As páginas combinam conteúdo renderizado no servidor e componentes interativos executados no navegador.

| Tecnologia | Função no projeto |
| --- | --- |
| HTML e JSX | Estruturam títulos, links, formulários e demais elementos da interface. JSX permite escrever essa estrutura dentro dos componentes React. |
| CSS | Define cores, tipografia, espaçamento, layout e adaptação a diferentes tamanhos de tela. |
| JavaScript | Implementa interações, validações e regras de funcionamento. |
| React | Organiza a interface em componentes reutilizáveis e atualiza a tela quando os dados mudam. |
| Next.js | Define as rotas, renderiza páginas e executa os endpoints do servidor. |
| PostgreSQL | Persiste configurações, publicações, solicitações, inscrições e dados de autenticação. |
| Resend | Envia os códigos de acesso e as respostas às solicitações de oficina. |
| Vercel | Hospeda a aplicação e executa o código do servidor em produção. |

A interface está principalmente em `app/` e `components/`. As regras do servidor ficam em `lib/`, acessadas pela API em `app/api/[...path]/route.js`.

O navegador apresenta os formulários e faz uma validação inicial. O servidor repete as verificações e decide se pode gravar os dados. A autorização administrativa também é verificada no servidor, independentemente dos botões visíveis na tela.

## 2. Executar localmente

Requisito: Node.js 22.9 ou superior. Na raiz do projeto:

```sh
npm install
npm run dev
```

O primeiro comando instala as dependências; o segundo inicia o servidor de desenvolvimento, normalmente em http://localhost:3000. Se essa porta estiver ocupada, use o endereço indicado no terminal. Ctrl+C encerra o processo.

As páginas institucionais e o guia podem ser consultados sem credenciais. Para habilitar login, solicitações e inscrições, configure `.env.local` e prepare o banco conforme a seção 14. Sem conexão com o serviço, os formulários ficam indisponíveis e não há dados fictícios substituindo os registros.

## 3. Estrutura dos arquivos

| Arquivo ou pasta | Para que serve |
| --- | --- |
| app/layout.js | Layout global, idioma e metadados da página |
| app/globals.css | Estilos globais, identidade visual e responsividade |
| app/page.js | Página inicial: apresentação, caminhos, guia, fórum e convite |
| app/guia/page.js | Capa, capítulos e links do PDF |
| app/forum/page.js | Carrega os dados da página de publicações |
| app/oficinas/page.js | Carrega os dados da página de oficinas |
| app/privacidade/page.js | Explica o tratamento dos dados |
| app/admin/page.js | Endereço /admin e proibição de indexação por buscadores |
| app/api/[...path]/route.js | Endpoints HTTP e encaminhamento das operações do servidor |
| app/loading.js | Mensagem durante carregamento |
| app/error.js | Tela para tentar novamente depois de um erro |
| app/not-found.js | Tela para endereço inexistente |
| components/Shell.js | Cabeçalho, navegação, rodapé e redes sociais |
| components/Icon.js | Desenhos SVG dos ícones |
| components/ui.js | Campos, botões, avisos, datas e função de comunicação com a API |
| components/Forum.js | Busca e categorias das publicações |
| components/Workshops.js | Solicitação, lista de vagas e janela de inscrição |
| components/Admin.js | Login e todas as telas administrativas |
| lib/content.js | Textos iniciais, menus, capítulos e redes sociais |
| lib/validation.js | Regras para conferir os dados recebidos |
| lib/db.js | Conexão com PostgreSQL |
| lib/data.js | Consultas públicas, sem dados pessoais dos inscritos |
| lib/auth.js | Código de acesso, sessão, origem e limites de tentativa |
| lib/mail.js | Envio de e-mails e repetição de envios pendentes |
| lib/workshops.js | Criação, inscrição e decisão sobre oficinas |
| database/schema.sql | Estrutura das tabelas |
| scripts/setup-db.mjs | Prepara o banco sem apagar registros existentes |
| scripts/docs.mjs | Confere se documentação e código correspondem |
| tests/ | Testes automatizados |
| public/ | Arquivos que podem ser baixados por qualquer visitante |
| package.json | Bibliotecas e comandos do projeto |
| package-lock.json | Versões exatas instaladas; deve acompanhar o repositório |
| next.config.mjs | Configuração do Next.js e cabeçalhos HTTP |
| jsconfig.json | Atalho @/ para importar arquivos a partir da raiz |
| .env.example | Modelo vazio das configurações privadas |
| .gitignore | Arquivos que não devem entrar no Git |

A logo original e o PDF original também permanecem na raiz como materiais de referência. O site utiliza as cópias em public. Não coloque senhas ou listas de participantes em public: tudo nessa pasta é público.

## 4. Componentes e funções compartilhadas

Um componente React reúne a estrutura e, quando necessário, o comportamento de uma parte da interface. `Home`, em `app/page.js`, compõe a página inicial; `Shell` acrescenta cabeçalho, navegação e rodapé.

```jsx
<h1 className="hero-title">{content.heroTitle}</h1>
```

Nesse trecho, `h1` define o título principal, `className` associa uma classe CSS e `content.heroTitle` fornece o texto. As chaves inserem uma expressão JavaScript no JSX.

| Recurso | Uso neste projeto |
| --- | --- |
| `useState` | Guarda valores que alteram a interface, como aba selecionada, formulário em edição ou aviso de erro. |
| `useEffect` | Executa ações ligadas ao ciclo do componente, como carregar o painel ou abrir uma janela de inscrição. |
| `useRef` | Mantém uma referência ao elemento `dialog`, usado na inscrição. |
| `onClick` e `onSubmit` | Associam funções aos cliques e ao envio dos formulários. |
| `map` | Gera elementos a partir de listas, como menus, oficinas e publicações. |
| `filter` | Seleciona os registros que correspondem à busca ou à categoria escolhida. |
| `async/await` | Organiza operações assíncronas, como consultas ao banco e chamadas à API. |

A diretiva `'use client'` marca componentes que precisam de recursos do navegador e interações React. As páginas sem essa diretiva podem carregar dados no servidor e passar os resultados aos componentes interativos.

### Utilitários de interface

O arquivo `components/ui.js` centraliza recursos usados em várias telas:

| Função ou componente | Responsabilidade |
| --- | --- |
| `api(path, data)` | Faz requisições para `/api/`. Sem dados, utiliza GET; com dados, envia POST em JSON. Converte respostas de erro em exceções. |
| `Field` | Padroniza rótulo, campo, indicação de obrigatoriedade e texto auxiliar. Pode renderizar input, select ou textarea. |
| `Submit` | Exibe o botão de envio e seu estado de processamento. |
| `Notice` | Apresenta mensagens de sucesso, erro ou atenção. |
| `Empty` | Mostra o estado de uma lista sem registros. |
| `DateLabel` | Formata datas no padrão brasileiro e no fuso de Fortaleza. |
| `PageIntro` | Padroniza a abertura das páginas internas. |
| `useFeedback` | Controla processamento e mensagens durante operações assíncronas. |

`components/Icon.js` reúne os desenhos SVG. A propriedade `name` seleciona o ícone e `size` define seu tamanho.

### Carregamento de dados

Em `lib/data.js`, `publicData()` consulta conteúdo, publicações e oficinas disponíveis. `pageData()` prepara esses dados para as páginas e retorna os textos iniciais quando o serviço está indisponível. Nesse caso, listas ficam vazias e `available` sinaliza a indisponibilidade.

Os componentes interativos recebem esses dados como propriedades. As alterações feitas no painel são enviadas à API e persistidas no banco.

## 5. Textos e conteúdo institucional

Os valores iniciais estão em `defaultContent`, no arquivo `lib/content.js`.

| Propriedade | Onde aparece |
| --- | --- |
| `heroTitle` | Título principal da página inicial |
| `heroDescription` | Apresentação abaixo do título |
| `about` | Descrição institucional na seção do projeto |
| `mission` | Objetivo do EMAI |
| `contactEmail` | Contato público do rodapé e da página de privacidade |
| `githubUrl` e `githubBranch` | Repositório e branch usados no download do código |
| `menus` | Nomes, ordem, destinos e visibilidade dos menus |

Após a preparação do banco, os textos salvos em `settings.content` têm prioridade sobre os valores iniciais. Portanto:

- Para editar um site já configurado, use **/admin → Configurações**.
- Para alterar os valores de uma nova instalação, edite `defaultContent`.
- Alterar `defaultContent` não sobrescreve os registros existentes.

As informações institucionais iniciais foram extraídas da apresentação do guia fornecido: EMAI, projeto de extensão da UFC ligado à BFEAAC.

## 6. Estilos e responsividade

Os estilos estão em `app/globals.css`. O bloco `:root` concentra as variáveis de identidade visual:

| Variável | Aplicação |
| --- | --- |
| `--navy` | Azul-marinho dos títulos, fundos e botões |
| `--blue` | Azul dos destaques e detalhes |
| `--ink` | Cor principal de texto |
| `--muted` | Textos secundários |
| `--soft` | Fundos claros |
| `--line` | Bordas e divisórias |

As principais classes de layout são `.container`, que limita a largura do conteúdo; `.hero-grid`, que organiza a abertura; `.section`, que define o espaçamento vertical; e `.button`, compartilhada pelos botões.

O arquivo é dividido em identidade visual, página inicial, páginas internas, formulários, administração e responsividade. As regras `@media` ajustam colunas, navegação e espaçamentos para telas menores.

Para modificar um bloco específico, procure sua `className` no componente e a regra correspondente no CSS. Alterações em classes compartilhadas afetam todas as telas que as utilizam. Confira o resultado em desktop e celular.

## 7. Cabeçalho, logo e redes sociais

`components/Shell.js` reúne cabeçalho, navegação e rodapé. A logo usada pelo site é `public/logo.svg`; um filtro CSS adapta sua apresentação aos fundos claros. O ícone da aba do navegador está em `public/favicon.svg`.

Os links oficiais estão em `socialLinks`, no arquivo `lib/content.js`:

| Rede | Endereço |
| --- | --- |
| Instagram | https://www.instagram.com/emai.ufc/ |
| TikTok | https://www.tiktok.com/@emai.ufc? |

Cada item define `name` (nome acessível), `icon` (ícone selecionado) e `href` (destino). Os desenhos correspondentes estão em `components/Icon.js`; a aparência do grupo é controlada por `.footer-social`.

Os links abrem em outra aba com `target="_blank"` e `rel="noopener noreferrer"`. Os rótulos acessíveis identificam a rede e informam esse comportamento.

## 8. Menus e novas páginas

A navbar contém Início, Guia educativo, Fórum e Oficinas. Todos usam o mesmo estilo de link textual em `components/Shell.js`, sem botão ou ícone exclusivo para Oficinas. O item O projeto foi removido da navegação; a seção institucional continua na página inicial. `publicSettings()` filtra o antigo menu `about` ao carregar configurações existentes, tanto no site público quanto no painel, preservando os demais rótulos, a ordem e a visibilidade.

Em **/admin → Configurações**, é possível alterar nomes, visibilidade e ordem dos menus. Os destinos continuam associados às páginas correspondentes. Deve permanecer pelo menos um menu visível.

Ocultar um item remove apenas o link da navegação; a página continua acessível pelo endereço.

Para acrescentar uma página:

1. Crie a rota em `app/`. Por exemplo, `app/equipe/page.js` corresponde a `/equipe`.
2. Exporte o componente da página e utilize `Shell` para manter a estrutura compartilhada.
3. Acrescente o menu em `defaultContent.menus`, com identificador único e destino correspondente.
4. Atualize também a lista armazenada no banco. A validação compara os menus recebidos com a definição atual do código.
5. Revise os testes e a documentação.

Os componentes em `components/` são reutilizáveis, mas não criam rotas por conta própria.

## 9. Atualizar o guia

O arquivo usado no site é public/guia-emai.pdf. O guia atual tem 49 páginas físicas.
A capa está em public/guia-capa.jpg e foi extraída do próprio PDF.
Para trocar a edição:
1. Substitua o PDF, mantendo esse nome para preservar os links.
2. Gere uma imagem da nova primeira página e substitua guia-capa.jpg.
3. Confira título, autoria, ano e número de páginas em app/guia/page.js.
4. Atualize a lista chapters em lib/content.js.
5. Confira cada link de capítulo.

Em chapters, cada item tem título, descrição e número da página física do PDF. O número exibido dentro do documento pode ser diferente. O link #page=7 pede ao leitor PDF a sétima página física.
Não altere a autoria nem a logo institucional ao trocar apenas o código.

## 10. Fórum: publicar, editar e apagar

O fórum é editorial: a equipe publica, os visitantes leem e pesquisam.
Em /admin → Fórum, clique em Nova publicação.
Preencha título, categoria e texto. A categoria é livre: notícias, materiais ou outra classificação.
Marque Publicar no fórum para tornar visível. Desmarque para guardar rascunho.
O texto é apresentado com as quebras de linha, sem interpretar HTML.
Isso evita que uma publicação execute scripts enviados como texto.

Editar abre os dados existentes. Salvar mantém a identidade da postagem.
Excluir exige uma segunda confirmação na tela.
Reiniciar fórum exige digitar exatamente APAGAR FÓRUM. Essa ação apaga publicações e rascunhos. Não apaga oficinas e inscrições.
Faça backup antes de usar. A versão atual não tem lixeira de publicações.

A busca em components/Forum.js filtra título e corpo no navegador. As categorias são calculadas a partir das publicações. A consulta pública entrega até 100 publicações recentes.

## 11. Solicitar uma oficina

Em /oficinas → Solicitar uma oficina, preencha:
- Instituição.
- Endereço completo e local do encontro.
- Data futura e horário.
- Pessoas da instituição.
- Vagas extras para a comunidade.
- E-mail do responsável.
- Autorização de uso dos dados.

Vagas extras são adicionais: 30 pessoas da escola e 5 extras significam capacidade prevista para 35 pessoas.
Zero vagas extras deixa o encontro fora da lista aberta à comunidade.
O fuso adotado é Fortaleza, UTC−3. O servidor converte para uma data com fuso antes de salvar.
São aceitas datas futuras até dois anos adiante, 1 a 1.000 pessoas e 0 a 500 vagas extras.

O fluxo é: formulário → POST /api/workshops → validação → tabela workshops com status pending.
O recebimento não confirma a oficina. A mensagem na tela avisa que haverá análise.
O identificador do pedido evita duplicar o mesmo envio se a resposta demorar.

## 12. Aprovar ou negar

Em /admin → Oficinas, selecione uma solicitação.
Confira os dados. Escolha Aprovar ou Não aprovar e escreva a justificativa.
Clique em Confirmar e enviar e-mail.

O servidor grava a decisão e uma mensagem na tabela outbox na mesma transação. Uma transação garante que as alterações sejam concluídas juntas; em caso de falha, elas são desfeitas.
Depois, tenta enviar o e-mail ao responsável da instituição.
Se o provedor falhar, a decisão permanece salva. A tela avisa e a mensagem fica disponível em Visão geral → Envios de e-mail → Tentar envio.
Não há tarefa automática de repetição nesta versão: a equipe usa esse botão.
O aceite pelo provedor não garante leitura ou entrega na caixa principal. Confira também o painel do serviço de e-mail.
A chave de idempotência reduz envios repetidos dentro do prazo de deduplicação do provedor, mas não substitui acompanhar envios antigos.

Uma solicitação já decidida não pode receber uma segunda decisão pelo mesmo endpoint.
Aprovação de data passada é recusada.
Apenas oficinas aprovadas, futuras e com extras aparecem na lista pública. Quando lotadas, o botão fica desabilitado.

## 13. Inscrição em vaga extra

O participante seleciona a oficina, informa nome e e-mail e confirma o uso dos dados.
A inscrição é salva em enrollments, vinculada à oficina.
Uma combinação de oficina e e-mail só pode aparecer uma vez.
A confirmação é mostrada na tela, junto com local e data. Não há e-mail automático de inscrição nesta versão.

O servidor usa FOR UPDATE para travar a linha da oficina enquanto conta e grava as vagas. Esse bloqueio impede que inscrições simultâneas utilizem a mesma vaga disponível.
A regra é conferida no banco, não apenas pelo número exibido na tela.
Os nomes e e-mails ficam no painel administrativo, nunca na consulta pública.

## 14. Configurar banco e e-mails

Crie um PostgreSQL em um provedor compatível, por exemplo Neon ou Supabase, usando a conta responsável pelo projeto.
Prefira a URL de conexão com pooler do provedor para a Vercel.
Copie .env.example para .env.local. Preencha:
| Variável | Significado |
| --- | --- |
| DATABASE_URL | Endereço completo do banco, incluindo credenciais e configuração de TLS |
| RESEND_API_KEY | Chave de API do Resend |
| EMAIL_FROM | Remetente em domínio verificado, como EMAI <oficinas@dominio.org> |
| APP_URL | Origem exata do site; localmente http://localhost:3000 |
| AUTH_SECRET | Segredo aleatório de pelo menos 32 caracteres |
| ADMIN_EMAIL | Administrador inicial; padrão studiosidealiza@gmail.com |

Para gerar AUTH_SECRET, execute:
```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie o resultado apenas para as variáveis privadas.
Execute `npm run db:setup`. O comando cria tabelas se elas não existirem e preserva registros.

O Gmail cadastrado recebe códigos. Ele não é automaticamente o remetente. Para enviar ao público pelo Resend, verifique um domínio e use um remetente desse domínio.
Credenciais não foram fornecidas com o projeto. Você precisa cadastrá-las antes de testar e-mails reais.

## 15. Como funciona o acesso /admin

1. O visitante pede um código, sem escolher livremente o destinatário.
2. O servidor consulta admin_email no banco.
3. Gera seis números aleatórios, válidos por dez minutos.
4. Guarda uma assinatura HMAC do código, não o código em texto aberto.
5. Envia o código ao e-mail cadastrado.
6. Confere a resposta e limita a cinco tentativas por código.
7. Se correta, consome o código e cria uma sessão válida por oito horas.

A sessão usa um token aleatório. O banco guarda somente seu hash.
O navegador recebe um cookie HttpOnly, SameSite=Strict e Secure em produção.
Toda consulta administrativa verifica a sessão. Operações de alteração conferem também a origem da requisição.
Limites de tentativa ficam no banco para funcionar entre instâncias da Vercel.

Para trocar o administrador, use Configurações → Acesso administrativo. Um código vai ao novo endereço. A troca só ocorre após a confirmação e encerra as sessões anteriores.
Alterar ADMIN_EMAIL depois de preparar o banco não troca a conta existente. Isso evita substituir silenciosamente o administrador.
Se houver perda total do e-mail, a recuperação exige acesso autorizado ao banco: atualizar admin_email, incrementar auth_version e remover sessões e desafios existentes dentro de uma transação. A equipe técnica deve fazer backup antes.

## 16. Estrutura e manutenção do banco

| Tabela | Conteúdo |
| --- | --- |
| settings | E-mail administrativo, versão de acesso e conteúdo editável |
| challenges | Códigos assinados, prazo, finalidade e tentativas |
| sessions | Hashes dos tokens e vencimento |
| rate_limits | Contadores temporários contra abuso |
| workshops | Pedidos, decisão e justificativa |
| enrollments | Nome e e-mail dos participantes |
| posts | Publicações e rascunhos |
| outbox | Mensagens a enviar e estado de envio |

Não exponha esse banco diretamente ao navegador. DATABASE_URL fica somente no servidor.
O esquema tem restrições para status e números válidos.
Mudar schema.sql não altera automaticamente uma tabela já existente. Para acrescentar colunas em produção, escreva uma migração SQL explícita e teste uma cópia do banco.
Para excluir dados pessoais ou cancelar inscrições, a versão atual exige manutenção autorizada no banco. Faça a operação correta pelo identificador, com backup e conferência. Não existe botão público de cancelamento.

As telas administrativas limitam a leitura a 1.000 oficinas, 10.000 inscrições, 1.000 publicações e 100 envios recentes. Para crescer além disso, implemente paginação; não interprete esses contadores como totais históricos ilimitados.
Revise periodicamente a retenção de dados, sessões vencidas e contadores antigos.

## 17. Endpoints da API

As consultas usam GET. As operações que alteram dados usam POST, com corpo em JSON.
| Endereço | Ação |
| --- | --- |
| GET /api/public | Conteúdo, publicações e vagas sem dados privados |
| GET /api/admin | Dados do painel, com sessão |
| POST /api/workshops | Solicitar oficina |
| POST /api/enroll | Ocupar uma vaga extra |
| POST /api/auth/request | Pedir código ao administrador |
| POST /api/auth/verify | Conferir código e criar cookie |
| POST /api/auth/logout | Encerrar sessão |
| POST /api/admin/decision | Aprovar/negar com justificativa |
| POST /api/admin/post | Criar/editar publicação |
| POST /api/admin/post-delete | Excluir uma publicação |
| POST /api/admin/forum-reset | Apagar fórum mediante frase de confirmação |
| POST /api/admin/settings | Atualizar textos, menus e GitHub |
| POST /api/admin/email/request | Pedir código para novo e-mail |
| POST /api/admin/email/verify | Confirmar troca e encerrar sessões |
| POST /api/admin/notify | Tentar envio de mensagem pendente |

Todas as alterações exigem JSON e origem permitida. A função api em components/ui.js concentra a chamada fetch e transforma erros em mensagens.
Não retire as validações do servidor mesmo que o formulário tenha required, min e max.

## 18. Publicar na Vercel e conectar ao GitHub

1. Crie um repositório na conta GitHub da instituição.
2. Envie os arquivos do projeto, incluindo package-lock.json e docs.
3. Confira que .env.local, node_modules e .next não estão no envio.
4. Na Vercel, importe esse repositório e selecione Next.js.
5. Use a versão Node compatível. O comando de build é npm run build.
6. Cadastre as variáveis privadas no painel da Vercel.
7. Configure APP_URL com o endereço HTTPS exato usado pelos visitantes, sem caminho.
8. Execute db:setup apontando para o banco certo, uma vez antes de usar.
9. Publique e teste as páginas, o login e uma solicitação controlada.
10. Cadastre a URL do repositório em /admin → Configurações.

Preview e produção podem ter endereços diferentes: cada ambiente precisa de APP_URL correto. Use um banco de teste para previews; não compartilhe dados reais desnecessariamente.
Não use exportação estática: o login, o banco e os e-mails precisam do servidor.
A Vercel reconhece Next.js; não é necessário vercel.json para esta estrutura.

Em Código do site, o botão de download aponta ao ZIP da branch configurada no GitHub.
Ele baixa a versão enviada ao repositório, não mudanças locais ainda não publicadas.
Repositórios privados exigem que a pessoa tenha acesso no GitHub. Nenhum token GitHub deve ser colocado no navegador.
Esta entrega não cria automaticamente uma conta, domínio ou repositório.

## 19. Testes e validação

`npm test` executa validações e integração com um PostgreSQL temporário em memória.
Os testes substituem fetch do serviço de e-mail: nenhum e-mail real é disparado.
São verificados códigos consumidos, código vencido, bloqueio após erros, sessão, alteração de e-mail, dados públicos, decisões, falha/reenvio e limite de vagas.
O banco de teste desaparece ao terminar. Não usa DATABASE_URL de produção.

`npm run build` compila uma versão de produção.
`npm start` serve essa versão após o build.
`npm run check` roda testes, conferência documental e build.

Faça também uma revisão manual: celular, teclado Tab, mensagens de erro, menu, guia e formulários.
A revisão automatizada não comprova entrega real de e-mail, aparência em todos os navegadores ou permissões de um serviço externo.

## 20. Atualização da documentação

Código e documentação devem ser revisados na mesma alteração:

1. Atualize a seção do manual afetada pela mudança.
2. Registre a alteração em `docs/ALTERACOES.md`.
3. Execute `npm run docs:update`.
4. Execute `npm run check`.
5. Inclua os arquivos atualizados no mesmo commit.

`docs:update` gera o inventário `MAPA-DE-ARQUIVOS.md` e registra hashes dos arquivos em `docs/revisao.json`. Um hash é um valor calculado a partir do conteúdo, usado para identificar mudanças.

`docs:check` compara os arquivos atuais com esse registro. Se houver diferenças, a verificação falha. Quando o código muda, `docs:update` também exige uma alteração no manual antes de registrar a revisão.

Essa checagem identifica documentação pendente, mas não avalia a precisão do texto. A revisão de conteúdo continua sendo responsabilidade de quem mantém o projeto.

## 21. Diagnóstico de problemas

| Situação | O que conferir |
| --- | --- |
| npm não é reconhecido | Node instalado e terminal reiniciado |
| Formulário indisponível | DATABASE_URL e db:setup |
| Código não chega | Chave Resend, remetente verificado, caixa de spam e limite de tentativas |
| Código expirado | Peça outro e use o mais recente |
| Origem não autorizada | APP_URL deve coincidir com protocolo e domínio usados |
| Alterei texto e nada mudou | Banco tem prioridade; edite pelo painel |
| Oficina não aparece | Precisa estar aprovada, no futuro e ter extras maiores que zero |
| E-mail falhou após aprovação | Abra Visão geral e tente o envio pendente |
| Download GitHub não funciona | Repositório, branch e acesso à conta |
| docs:check falhou | Atualize o manual e execute docs:update |

## 22. Referências técnicas

- React: https://react.dev/learn
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Resend: https://resend.com/docs
- PGlite, utilizado somente em testes: https://pglite.dev/docs/


### Verificações da implementação

Os sete testes de validação e os dez cenários de integração passaram. A integração usa a porta local 55439; deixe-a livre ao executar npm test. Os e-mails são interceptados somente pelo teste, sem envio externo.

### Configuração local e publicação
A conexão local é definida em .env.local, arquivo ignorado pelo Git. Após preencher DATABASE_URL, execute npm run db:setup para preparar as tabelas. A configuração local não transfere automaticamente variáveis para a Vercel: confira DATABASE_URL, AUTH_SECRET, APP_URL e as variáveis de envio de e-mail no ambiente de produção. Nunca copie valores de credenciais para este manual.

### Envio administrativo em desenvolvimento
RESEND_API_KEY e EMAIL_FROM foram configurados no ambiente local e o envio foi aceito pelo provedor. O remetente de testes do Resend permite enviar à conta autorizada pelo serviço. Para responder a instituições e participantes com outros endereços, configure um domínio verificado. Após alterar .env.local, reinicie o servidor. Os códigos de teste não devem ser usados para entrar: solicite um novo em /admin para que o navegador mantenha o identificador da solicitação.

### Equipe no README
A seção Equipe usa uma tabela HTML com imagens em docs/equipe/. Os PNGs têm fundo transparente e recorte circular incorporado, sem depender de CSS no GitHub. A ordem é Cibelly Lavor, Helionardo Mendes, Herbert Davi, Napoleão, Roberto Romulo e Lucas. Lucas usa apenas a inicial em SVG, sem fotografia. Para atualizar a equipe, substitua a imagem e ajuste nome, caminho e texto alternativo no README. Essa seção pertence à documentação do repositório.

### Estrutura visual sem faixas auxiliares
O cabeçalho começa diretamente na navbar, em components/Shell.js. A faixa superior da universidade foi removida. Na home, app/page.js passa da abertura para a seção institucional, sem a faixa intermediária dos quatro temas. As regras CSS exclusivas dessas duas faixas também foram removidas.
