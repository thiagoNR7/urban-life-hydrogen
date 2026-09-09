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

Essas quatro telas não existiam no tema com visual próprio (o Horizon as
renderizava com componentes dele). Foram escritas do zero usando os tokens
`--ul-*` para não destoar, mas o layout é arbitrário.

## Regras de estilo

- **Nunca introduzir cor, espaçamento, raio ou fonte fora de `ul-tokens.css`.**
  Se precisar de um valor novo, adicionar como token primeiro.
- Prefixo de classe é `ul-`, padrão BEM: `.ul-bloco__elemento--modificador`.
- CSS puro, sem Tailwind. Os arquivos entram por `<link>` no `Layout` de
  `app/root.jsx`, nesta ordem: tokens → base → animations → sections → shop → app.
  A ordem importa: tokens define as variáveis que os outros consomem.
- Idioma da interface: português do Brasil.

## Bugs conhecidos, ainda não corrigidos

1. **Imagem de produto achatada.** `.ul-product__image` usa `aspectRatio="4/5"`
   com `object-fit: cover`. Funciona para foto de cesta (vertical), destrói
   produto alto e estreito. Falta uma estratégia que respeite proporções variadas.

2. **Imagem do carrinho estourando o layout.** `.ul-cart__line-image` define
   96x96 no CSS, mas o `<Image>` do Hydrogen gera width/height inline que
   ganham da regra. Resultado: a imagem ocupa a largura toda e empurra o
   resumo para fora da tela, criando scroll horizontal.

3. **Sem retorno visual ao adicionar ao carrinho.** O `CartForm` na página de
   produto adiciona o item mas não abre o carrinho lateral nem dá feedback.
   O usuário clica várias vezes achando que não funcionou. Existe um
   `Aside.Provider` com `<Aside type="cart">` no `PageLayout` que poderia ser
   acionado.

## Coisas a saber sobre o Hydrogen aqui

- `app/routes/collections.all.jsx` (do esqueleto) tem precedência sobre
  `collections.$handle.jsx` para a URL `/collections/all`. "all" não é uma
  coleção real no Shopify, é um atalho para todos os produtos.
- `useUlReveal` re-observa os elementos a cada mudança de rota. O script
  original rodava um `querySelectorAll` uma vez no load, o que quebra em SPA.
- A página de produto faz duas queries de propósito: catálogo com
  `CacheLong()` e estoque com `CacheShort()`. Não juntar as duas.
- `quantityAvailable` só retorna número se o token do canal Headless tiver
  permissão de inventário. Sem isso volta `null` e o aviso de estoque baixo
  some sem erro.

## Conteúdo

`app/data/content.js` guarda o que antes era editável no editor de temas:
textos do hero, os 3 passos do "Como funciona", as 4 zonas de entrega com
bairros e dias, e os links do rodapé. Hoje exige deploy para mudar. O plano
é migrar para Metaobjects do Shopify.

## Comandos

```bash
npm run dev      # sobe em localhost:3000
npm run build
npm run lint
```

Ferramentas úteis em dev:
- `localhost:3000/graphiql` — testar queries da Storefront API
- `localhost:3000/subrequest-profiler` — ver o que veio do cache
