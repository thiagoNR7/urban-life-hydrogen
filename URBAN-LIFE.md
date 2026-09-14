# Urban Life — contexto do projeto

Loja de cestas de alimentos de hortas urbanas de São Paulo, com entrega
programada por zona. Front próprio em Hydrogen, back no Shopify.

## Origem

Este projeto é um porte de um tema Shopify (réplica do Horizon) para Hydrogen.
O repositório do tema original é `thiagoNR7/Urban-Life-Shopify-Main-Replica`.
O tema, por sua vez, tinha sido convertido de um projeto React/Tailwind/shadcn
chamado `urbanlife-sp`.

## O que é fiel ao design original e o que não é

**Fiel — portado 1:1 do tema, não mudar sem pedido explícito:**

- `app/components/UlHeader.jsx` — de `sections/ul-header.liquid`
- `app/components/UlHero.jsx` — de `sections/ul-hero.liquid`
- `app/components/UlStatsBar.jsx` — de `sections/ul-stats-bar.liquid`
- `app/components/UlHowItWorks.jsx` — de `sections/ul-how-it-works.liquid`
- `app/components/UlDeliveryRegions.jsx` — de `sections/ul-delivery-regions.liquid`
- `app/components/UlFooter.jsx` — de `sections/ul-footer.liquid`
- `app/components/UlIcon.jsx` — de `snippets/ul-icon.liquid`
- `app/styles/ul-tokens.css` — cópia byte a byte, é a fonte da verdade do design
- `app/styles/ul-base.css` — cópia byte a byte
- `app/styles/ul-animations.css` — cópia byte a byte
- `app/styles/ul-sections.css` — extraído dos blocos `{% stylesheet %}` das sections

**Inventado — não veio de nenhum design, pode ser refeito à vontade:**

- `app/routes/products.$handle.jsx` e a parte `.ul-product__*` de `ul-shop.css`
- `app/routes/collections.$handle.jsx` e a parte `.ul-collection__*`
- `app/routes/cart.jsx` e a parte `.ul-cart__*`
- `app/components/UlProductCard.jsx` e a parte `.ul-product-card__*`
- `app/routes/pages.produtores._index.jsx` (listagem) e
  `pages.produtores.$handle.jsx` (detalhe), com os componentes
  `UlProducerCard`, `UlProducerModal`, `UlProducerGallery`, `UlShareCard`,
  `UlBasketPicker`, `UlHortaProductCard` — e `ul-produtores.css` /
  `ul-produtor-detalhe.css`
- `app/routes/account.jsx` e as sub-rotas `account.orders._index.jsx`,
  `account.profile.jsx`, `account.addresses.jsx` (JSX e textos reescritos
  em cima do esqueleto padrão; loaders/actions/queries são as do esqueleto),
  mais `UlAccountMenu.jsx` e `ul-conta.css`

Essas telas não existiam no tema com visual próprio (o Horizon as renderizava
com componentes dele, ou nem existiam — produtores e conta são conceito novo
deste projeto). Foram escritas do zero usando os tokens `--ul-*` para não
destoar, mas o layout é arbitrário.

As demais rotas de `app/routes/` (blogs, coleções-índice, políticas, busca,
`account_.login/authorize/logout`, sitemap etc.) ainda são o padrão do
esqueleto Hydrogen — em inglês, sem os estilos `ul-*`. Ninguém pediu para
mexer nelas ainda.

## Regras de estilo

- **Nunca introduzir cor, espaçamento, raio ou fonte fora de `ul-tokens.css`.**
  Se precisar de um valor novo, adicionar como token primeiro.
- Prefixo de classe é `ul-`, padrão BEM: `.ul-bloco__elemento--modificador`.
- CSS puro, sem Tailwind. Os arquivos entram por `<link>` no `Layout` de
  `app/root.jsx`, nesta ordem: tokens → base → animations → sections → shop →
  app → updates → produtores → produtor-detalhe → conta → mobile.
  A ordem importa: tokens define as variáveis que os outros consomem, e cada
  arquivo depois sobrescreve o anterior sem editá-lo. `ul-mobile.css` é
  sempre o último — é a camada final de ajuste responsivo.
- Idioma da interface: português do Brasil.

### Uma pegadinha de `box-sizing`

`.ul-container` (em `ul-base.css`, fiel — não mexer lá) nunca definiu
`box-sizing`, então fica no `content-box` padrão do browser. Com
`padding-inline` fixo, isso soma o padding por cima do `max-width` em vez de
para dentro dele, e o contêiner passa a largura da tela (mais visível no
mobile, onde nenhum `max-width` breakpoint ainda entrou em ação). A correção
mora em `ul-updates.css` — `.ul-container { box-sizing: border-box }`, sem
media query, porque vale pro site inteiro. Se essa regra sumir de novo (o
arquivo já foi sobrescrito por fora uma vez), é esse o sintoma: contêiner
64px mais largo que devia, mais evidente em telas pequenas.

## Páginas que existem hoje

**Com identidade própria (`ul-*`), em pt-BR:**

- `/` — home (hero, stats, como funciona, zonas de entrega, rodapé)
- `/products/{handle}` — produto
- `/cart` — carrinho
- `/collections/{handle}` — coleção
- `/pages/produtores` — listagem de produtores, com busca e filtros por
  bairro/cultivo/agroecológico
- `/pages/produtores/{handle}` — detalhe do produtor: galeria, cartão de
  divulgação, seletor de cesta com troca de itens, produtos da horta
- `/account/orders`, `/account/profile`, `/account/addresses` — área da
  conta, com o layout `account.jsx` (saudação, navegação por abas, sair)

**Ainda no padrão do esqueleto** (funcionam, mas em inglês e sem os estilos
`ul-*`): blogs, `collections._index`, `collections.all`, `pages.$handle`
(páginas genéricas do Shopify), `policies.*`, `search`, o fluxo
`account_.login` / `account_.authorize` / `account_.logout`, sitemap e
robots.txt.

## Produtores

- Metaobject de tipo `produtor_luis` (não é `produtor` — o Shopify gerou um
  handle com sufixo; ver `PRODUCER_METAOBJECT_TYPE` em `app/data/producers.js`).
- Campos lidos com tolerância a renomeação: `PRODUCER_FIELDS` tenta uma lista
  de chaves por informação (ex.: `nome_horta` primeiro, `horta` como
  alternativa).
- `/pages/produtores/{handle}` busca também os produtos da horta (metacampo
  `custom.produtor`, referência ao metaobject do produtor) e o catálogo de
  itens (metaobject `item_horta`, ver abaixo) para montar o seletor de cesta.
- Na loja em produção (Shopify puro, sem Hydrogen) a URL de listagem precisa
  do parâmetro `?view=produtores` para não cair no template de página
  genérico — isso é só da produção. Aqui a rota `pages.produtores._index.jsx`
  tem precedência incondicional sobre `pages.$handle.jsx`, então
  `/pages/produtores` já funciona direto, sem esse parâmetro.

## Cestas e o modelo de troca de itens

- A cesta é **um produto só**, com três variantes — "Pequena (P)", "Média
  (M)", "Grande (G)" — não três produtos (`BASKET_PRODUCT_HANDLE`).
- Cada tamanho permite 1 troca (`BASKET_SIZES`, campo `swaps`). Escalonar
  (1/2/3 por tamanho) foi cogitado e descartado: previsibilidade na
  separação venceu flexibilidade marginal.
- O catálogo de itens trocáveis vem do metaobject `item_horta` (ver seção
  abaixo). A regra de substituição (`canSubstitute` em
  `app/data/producers.js`) exige, ao mesmo tempo: mesmo grupo, preço igual ou
  menor, disponível na semana, e ainda fora da cesta atual.
- Os metacampos `custom.itens_cesta_p/m/g` aceitam dois formatos ao mesmo
  tempo, de propósito — **lista de referência a metaobjeto** (o caminho
  novo, traz grupo e preço junto) e **lista de texto** (formato antigo,
  casado pelo nome no catálogo). Isso permite migrar o admin sem quebrar a
  página no meio do caminho; quando a migração terminar, o ramo de texto em
  `toBaskets()` pode sair.
- Cada troca vira um atributo de linha do carrinho (`Troca 1: Rúcula →
  Agrião`), então chega ao pedido do admin e à separação.
- O passo a passo de cadastro no admin (campos do metaobject, tabela de
  preços, grupos, revisão dos nomes de ervas incertos) está em
  `ITENS-HORTA.md` — não repetido aqui.

**Atenção, isso pode estar dessincronizado:** `ITENS-HORTA.md` manda cadastrar
4 grupos no admin (Folhas, Temperos e ervas, Raízes, Frutos). O código já
assume só 3 (`ITEM_GROUPS` em `producers.js` = Folhas / Temperos e ervas /
**Legumes**, fundindo Raízes e Frutos), mas essa constante não é usada em
lugar nenhum além de documentar a intenção — `canSubstitute` compara
`candidate.group !== outgoing.group` direto com o que estiver salvo no
admin. Se os itens de raiz/fruto ainda estiverem com `grupo` = "Raízes" ou
"Frutos" separados (como o guia manda cadastrar), a troca entre eles **não
funciona de verdade**, mesmo com o comentário no código dizendo que funciona.
Confira o valor real do campo no admin antes de assumir que a fusão já
aconteceu.

## Metaobject `item_horta`

Tipo `item_horta` (`ITEM_METAOBJECT_TYPE`). Alimenta tanto a composição da
cesta (via metacampo de referência) quanto as opções de troca. Campos lidos
com a mesma tolerância dos de produtor (`ITEM_FIELDS`): nome, unidade, grupo,
preço, disponibilidade, foto. Setup completo do metaobject (nomes de campo
reais no admin, tipo de cada um, obrigatoriedade) e a tabela de preços para
cadastrar estão em `ITENS-HORTA.md`.

## Login com a Customer Account API

- `account.jsx` é o layout: exige sessão (senão redireciona pro login) e
  mostra saudação, e-mail e a navegação por abas (Pedidos / Perfil /
  Endereços / Sair).
- `account_.login.jsx`, `account_.authorize.jsx`, `account_.logout.jsx` são o
  fluxo OAuth padrão do esqueleto Hydrogen, sem alteração.
- `account_.me.jsx` é uma rota de recurso separada, só para o popover de
  conta do cabeçalho (`UlAccountMenu.jsx`): devolve `{loggedIn, firstName,
  email, accountUrl}` em JSON. Existe separada do layout `account.jsx` de
  propósito — assim o popover só bate na Customer Account API quando alguém
  abre o menu, não em toda navegação.
- Quando logado **e** a loja tem `SHOP_ID` (setado pelo Oxygen em produção),
  os atalhos "Pedidos" e "Perfil" do popover apontam para
  `shopify.com/{shopId}/account/...` — as páginas de conta **hospedadas pela
  Shopify**, não para as rotas `ul-conta` deste repo. Sem `SHOP_ID` (típico
  em dev local sem vínculo com uma vitrine), cai em `/account`, aí sim as
  rotas daqui. Ou seja: as telas `account.orders` / `account.profile` /
  `account.addresses` reskinned existem e funcionam, mas em produção só quem
  navegar direto pra URL (ou o próprio fluxo de redirecionamento
  pós-login) as vê pelos atalhos — vale confirmar se é isso mesmo que se
  quer.
- Login com Google **não é implementado no front**: liga no admin
  (Configurações → Contas de clientes, contas de clientes novas). Com isso
  ligado, o botão do Google aparece sozinho na tela de login hospedada.
- O CTA "Sou Produtor" do cabeçalho (`/account/register`) cai em
  `account.$.jsx`, o catch-all — que só confere a sessão e redireciona para
  `/account`. Não existe um cadastro de produtor separado do login de
  cliente comum ainda.
- **Em dev local, `/account/*` exige o túnel do Hydrogen.** Sem rodar com
  `--customer-account-push` e abrir pela URL do túnel (não por
  `localhost`), a Customer Account API responde 400 com "Customer Account
  API OAuth requires a Hydrogen tunnel in local development" — isso não é
  bug, é a exigência da própria API. `vite.config.js` já libera
  `server.allowedHosts: ['.trycloudflare.com', '.tryhydrogen.dev']` para o
  domínio do túnel funcionar. Passos completos: ver `README.md`, seção
  "Setup for using Customer Account API".

## O que ainda falta

1. `CUSTOMER_DETAILS_QUERY` (usada pelo layout `account.jsx`) não busca
   `emailAddress` — o `<p className="ul-conta__email">` da própria página de
   conta fica em branco. `UL_CUSTOMER_SUMMARY_QUERY` (usada só pelo popover
   do cabeçalho) já busca; bastaria replicar o campo na primeira.
2. `ORDER_ITEM_FRAGMENT` (`CustomerOrdersQuery.js`) não busca itens de linha
   nem imagem — os `ul-order__thumbs`/`ul-order__thumb` da lista de pedidos
   têm CSS e JSX prontos, mas nunca renderizam por falta de dado.
3. Grupos de troca "Raízes"/"Frutos" vs. "Legumes" dessincronizados entre
   `ITENS-HORTA.md` e o admin real — ver aviso na seção de cestas acima.
4. Conteúdo do hero, "Como funciona", zonas de entrega e rodapé continua
   hardcoded em `app/data/content.js`, exigindo deploy pra mudar. Produtores
   e itens da horta já migraram para metaobjects; essas seções, não.
5. Sem fluxo de cadastro de produtor: o CTA "Sou Produtor" loga como cliente
   comum, não abre nenhum formulário de inscrição.
6. `app/styles/ul-produtor-detalhe.css` foi sobrescrito por fora e voltou a
   uma versão anterior às correções que tinham sido medidas contra a
   produção (fundo/sombra da galeria, raio e sombra do cartão de cestas,
   divisória do seletor P/M/G, cor e `line-height` da descrição, tamanho do
   selo). Precisa refazer essas correções — o resultado esperado de cada
   uma está registrado nas conversas anteriores, não neste arquivo.

## Coisas a saber sobre o Hydrogen aqui

- `app/routes/collections.all.jsx` (do esqueleto) tem precedência sobre
  `collections.$handle.jsx` para a URL `/collections/all`. "all" não é uma
  coleção real no Shopify, é um atalho para todos os produtos. Mesma
  mecânica faz `pages.produtores._index.jsx` vencer `pages.$handle.jsx`
  para `/pages/produtores`.
- `useUlReveal` re-observa os elementos a cada mudança de rota. O script
  original rodava um `querySelectorAll` uma vez no load, o que quebra em SPA.
- A página de produto faz duas queries de propósito: catálogo com
  `CacheLong()` e estoque com `CacheShort()`. Não juntar as duas.
- `quantityAvailable` só retorna número se o token do canal Headless tiver
  permissão de inventário. Sem isso volta `null` e o aviso de estoque baixo
  some sem erro.
- `<Money>` (via `useMoney`) lê o locale do `<ShopifyProvider>` em
  `root.jsx`, **não** do `i18n` passado a `createHydrogenContext` em
  `app/lib/context.js` — são dois lugares diferentes. Sem o
  `<ShopifyProvider languageIsoCode="PT" countryIsoCode="BR">`, os preços
  formatam em `en-US` (`R$3.00`) mesmo com o contexto do storefront em
  português.

## Conteúdo

`app/data/content.js` guarda o que antes era editável no editor de temas:
textos do hero, os 3 passos do "Como funciona", as zonas de entrega (5 no
total — Zona Norte e Zona Leste ativas, Centro Expandido/Zona Oeste/Zona Sul
em "Em breve") e os links do rodapé. Hoje exige deploy para mudar. Produtores
(`item_horta` e o metaobject de produtor) já são Metaobjects do Shopify;
migrar o resto deste arquivo é trabalho futuro.

## Comandos

```bash
npm run dev      # sobe em localhost:3000
npm run build
npm run lint
```

Ferramentas úteis em dev:
- `localhost:3000/graphiql` — testar queries da Storefront API
- `localhost:3000/subrequest-profiler` — ver o que veio do cache
- Para testar `/account/*` localmente, ver a seção de login acima — precisa
  do túnel do Hydrogen, `localhost` puro não serve.
