import {useMemo, useState} from 'react';
import {useLoaderData} from 'react-router';
import {UlDestaqueCard} from '~/components/UlDestaqueCard';
import {
  PRODUCER_FIELDS,
  PRODUCT_PRODUCER_METAFIELD,
} from '~/data/producers';

/**
 * Produtos em destaque — /collections/all
 *
 * Substitui a rota do esqueleto, que renderizava `ProductItem` do template
 * com o título "Hydrogen | Products". É para cá que o item "Produtos em
 * destaque" do cabeçalho aponta (`app/data/content.js`).
 *
 * POR QUE ESTE ARQUIVO EXISTE, e não é o `collections.$handle.jsx` que
 * responde: "all" não é uma coleção de verdade no Storefront API —
 * `collection(handle: "all")` volta nulo. Por isso a consulta aqui é a
 * `products`, direto. Apagar este arquivo faz /collections/all cair no
 * $handle, procurar uma coleção chamada "all", não achar e dar 404.
 *
 * A separação entre cesta e produto da horta vem do metacampo
 * `custom.tipo_produto` ("Tipo de produto Urban Life" no admin), que guarda
 * valores de máquina: `cesta` e `produto_especial`. Os rótulos em português
 * ficam no mapa TIPOS abaixo.
 *
 * POR QUE NÃO O `productType` NATIVO: em 17/09 ele foi preenchido com "Cesta"
 * e "Produto da Horta" antes de descobrirmos que `custom.tipo_produto` já
 * existia e já estava preenchido nos dois produtos. Ficaram duas fontes para
 * a mesma informação. Vale a de máquina: mudar o rótulo que aparece na tela
 * não quebra o filtro, e um produto cadastrado com só um dos dois campos
 * preenchidos apareceria numa página e sumiria da outra.
 *
 * Se um valor novo entrar em `custom.tipo_produto` sem estar no mapa TIPOS, o
 * produto continua aparecendo em "Todos" e no card o selo mostra o valor cru.
 *
 * FILTRO POR HORTA É FEITO EM MEMÓRIA, não na consulta. O vínculo
 * produto-produtor é referência de metaobject, e a Storefront API não permite
 * buscar por isso na string de `query` — a página do produtor tem a mesma
 * limitação e resolve do mesmo jeito. Com catálogo pequeno é barato; passando
 * de algumas centenas de produtos, vale uma coleção por produtor.
 */

const TIPO_CESTA = 'cesta';
const TIPO_HORTA = 'produto_especial';

/** Valor gravado no metacampo → rótulo mostrado na tela. */
export const TIPOS = {
  [TIPO_CESTA]: 'Cesta',
  [TIPO_HORTA]: 'Produto da Horta',
};

export const meta = () => [
  {title: 'Produtos em destaque | Urban Life'},
  {
    name: 'description',
    content:
      'Cestas e produtos cultivados e produzidos por hortas urbanas de São Paulo. Escolha de qual horta você quer comprar.',
  },
];

/**
 * Lê um campo do metaobject aceitando os nomes alternativos de
 * `PRODUCER_FIELDS` — o primeiro que existir vence. Reusa o mapa em vez de
 * fixar `nome_horta` aqui: se o campo for renomeado no admin, muda num lugar
 * só.
 */
function campo(fields, nomes) {
  for (const nome of nomes) {
    const achado = fields?.find((f) => f.key === nome);
    if (achado?.value) return achado.value;
  }
  return null;
}

function lerProdutor(referencia) {
  if (!referencia) return null;
  const fields = referencia.fields ?? [];

  return {
    handle: referencia.handle,
    name: campo(fields, PRODUCER_FIELDS.horta) ?? campo(fields, PRODUCER_FIELDS.name),
    neighborhood: campo(fields, PRODUCER_FIELDS.neighborhood),
    region: campo(fields, PRODUCER_FIELDS.region),
  };
}

export async function loader({context}) {
  const {storefront} = context;

  // Sem paginação: o catálogo real é pequeno e os filtros abaixo são de
  // cliente. Passando de ~100 produtos, isto precisa virar paginado ou os
  // filtros precisam ir para o servidor.
  const {products} = await storefront.query(PRODUTOS_QUERY, {
    variables: {
      first: 100,
      namespace: PRODUCT_PRODUCER_METAFIELD.namespace,
      key: PRODUCT_PRODUCER_METAFIELD.key,
    },
    cache: storefront.CacheLong(),
  });

  const produtos = (products?.nodes ?? []).map((p) => ({
    ...p,
    tipo: p.tipo?.value ?? null,
    produtor: lerProdutor(p.produtor?.reference),
  }));

  return {produtos};
}

export default function ProdutosEmDestaque() {
  const {produtos} = useLoaderData();

  const [aba, setAba] = useState('todos');
  const [painelAberto, setPainelAberto] = useState(false);
  const [horta, setHorta] = useState('todas');
  const [tamanho, setTamanho] = useState('todos');
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [ordem, setOrdem] = useState('relevancia');

  const hortas = useMemo(() => {
    const mapa = new Map();
    for (const p of produtos) {
      if (p.produtor?.handle && p.produtor?.name) {
        mapa.set(p.produtor.handle, p.produtor.name);
      }
    }
    return [...mapa.entries()];
  }, [produtos]);

  const lista = useMemo(() => {
    let saida = produtos;

    if (aba === 'cestas') {
      saida = saida.filter((p) => p.tipo === TIPO_CESTA);
    } else if (aba === 'horta') {
      saida = saida.filter((p) => p.tipo === TIPO_HORTA);
    }

    if (horta !== 'todas') {
      saida = saida.filter((p) => p.produtor?.handle === horta);
    }

    if (tamanho !== 'todos') {
      // As variantes se chamam "Pequena (P)", "Média (M)", "Grande (G)" —
      // por isso a busca é pelo sufixo entre parênteses, e não pelo nome.
      const marca = `(${tamanho})`;
      saida = saida.filter((p) =>
        (p.options ?? []).some((o) =>
          (o.values ?? []).some((v) => v.includes(marca)),
        ),
      );
    }

    if (somenteDisponiveis) {
      saida = saida.filter((p) => p.availableForSale);
    }

    const preco = (p) => Number(p.priceRange?.minVariantPrice?.amount ?? 0);

    if (ordem === 'menor') {
      saida = [...saida].sort((a, b) => preco(a) - preco(b));
    } else if (ordem === 'maior') {
      saida = [...saida].sort((a, b) => preco(b) - preco(a));
    } else if (ordem === 'nome') {
      saida = [...saida].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    }

    return saida;
  }, [produtos, aba, horta, tamanho, somenteDisponiveis, ordem]);

  const filtrosAtivos =
    (horta !== 'todas' ? 1 : 0) +
    (tamanho !== 'todos' ? 1 : 0) +
    (somenteDisponiveis ? 1 : 0);

  function limparFiltros() {
    setHorta('todas');
    setTamanho('todos');
    setSomenteDisponiveis(false);
  }

  return (
    <section className="ul-destaque">
      <div className="ul-container">
        <header className="ul-destaque__intro">
          <span className="ul-destaque__pilula">
            <span aria-hidden="true">🌱</span> Direto das hortas
          </span>
          <h1 className="ul-destaque__heading">Produtos frescos das hortas</h1>
          <p className="ul-destaque__subheading">
            Descubra cestas e produtos cultivados e produzidos por hortas
            urbanas de São Paulo. Escolha de qual horta você quer comprar.
          </p>
        </header>

        <div className="ul-destaque__barra">
          <div className="ul-destaque__abas" role="tablist">
            <Aba atual={aba} valor="todos" onSelect={setAba}>
              Todos
            </Aba>
            <Aba atual={aba} valor="cestas" onSelect={setAba}>
              Cestas
            </Aba>
            <Aba atual={aba} valor="horta" onSelect={setAba}>
              Produtos da Horta
            </Aba>
          </div>

          <div className="ul-destaque__controles">
            <button
              className={`ul-destaque__filtros-btn${
                painelAberto ? ' is-active' : ''
              }`}
              type="button"
              aria-expanded={painelAberto}
              aria-controls="ul-destaque-painel"
              onClick={() => setPainelAberto((v) => !v)}
            >
              Filtros
              {filtrosAtivos > 0 ? (
                <span className="ul-destaque__filtros-contador">
                  {filtrosAtivos}
                </span>
              ) : null}
            </button>

            <label className="ul-destaque__ordenar">
              <span className="ul-visually-hidden">Ordenar por</span>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                <option value="relevancia">Ordenar: Relevância</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="nome">Nome (A–Z)</option>
              </select>
            </label>
          </div>
        </div>

        <div
          className="ul-destaque__painel"
          id="ul-destaque-painel"
          hidden={!painelAberto}
        >
          <div className="ul-destaque__campo">
            <span className="ul-destaque__rotulo">Produtor / Horta</span>
            <select value={horta} onChange={(e) => setHorta(e.target.value)}>
              <option value="todas">Todas as hortas</option>
              {hortas.map(([h, nome]) => (
                <option key={h} value={h}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="ul-destaque__campo">
            <span className="ul-destaque__rotulo">Tamanho da cesta</span>
            <div className="ul-destaque__tamanhos">
              {[
                ['todos', 'Todos'],
                ['P', 'P'],
                ['M', 'M'],
                ['G', 'G'],
              ].map(([valor, texto]) => (
                <button
                  key={valor}
                  className={`ul-destaque__tamanho${
                    tamanho === valor ? ' is-active' : ''
                  }`}
                  type="button"
                  onClick={() => setTamanho(valor)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          <label className="ul-destaque__check">
            <input
              type="checkbox"
              checked={somenteDisponiveis}
              onChange={(e) => setSomenteDisponiveis(e.target.checked)}
            />
            Somente disponíveis
          </label>

          <button
            className="ul-destaque__limpar"
            type="button"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        <p className="ul-destaque__contagem" aria-live="polite">
          {lista.length === 1
            ? '1 produto encontrado'
            : `${lista.length} produtos encontrados`}
        </p>

        {lista.length === 0 ? (
          <p className="ul-destaque__vazio">
            Nenhum produto com esses filtros. Tente limpar a seleção ou volte
            na segunda — a horta reabre a seleção toda semana.
          </p>
        ) : (
          <div className="ul-destaque__grid">
            {lista.map((produto, i) => (
              <UlDestaqueCard
                key={produto.id}
                product={produto}
                loading={i < 4 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Aba({atual, valor, onSelect, children}) {
  const ativa = atual === valor;

  return (
    <button
      className={`ul-destaque__aba${ativa ? ' is-active' : ''}`}
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={() => onSelect(valor)}
    >
      {children}
    </button>
  );
}

/**
 * O fragmento está escrito aqui dentro, e não importado de lib/fragments,
 * pelo mesmo motivo do `collections.$handle.jsx`: interpolar com template
 * string funciona em runtime, mas o codegen analisa o arquivo estaticamente
 * e acusa "Unknown fragment".
 */
const PRODUTOS_QUERY = `#graphql
  fragment DestaqueCard on Product {
    id
    title
    handle
    availableForSale
    options {
      name
      values
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    tipo: metafield(namespace: "custom", key: "tipo_produto") {
      value
    }
    produtor: metafield(namespace: $namespace, key: $key) {
      reference {
        ... on Metaobject {
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
  query ProdutosEmDestaque(
    $first: Int!
    $namespace: String!
    $key: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes { ...DestaqueCard }
    }
  }
`;
