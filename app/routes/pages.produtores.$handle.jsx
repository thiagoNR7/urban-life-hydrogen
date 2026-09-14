import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {UlIcon} from '~/components/UlIcon';
import {UlProducerGallery} from '~/components/UlProducerGallery';
import {UlShareCard} from '~/components/UlShareCard';
import {UlBasketPicker} from '~/components/UlBasketPicker';
import {UlHortaProductCard} from '~/components/UlHortaProductCard';
import {
  BASKET_ITEM_METAFIELDS,
  BASKET_PRODUCT_HANDLE,
  ITEM_FIELDS,
  ITEM_METAOBJECT_TYPE,
  BASKET_SIZES,
  PRODUCER_FIELDS,
  PRODUCER_METAOBJECT_TYPE,
  PRODUCT_PRODUCER_METAFIELD,
  producerDetailUi,
} from '~/data/producers';

/**
 * /pages/produtores/{handle}
 *
 * Detalhe do produtor: galeria, dados, seletor de cesta e os produtos da
 * horta. Precede `pages.$handle.jsx` do esqueleto, igual à listagem.
 *
 * Os produtos da horta são buscados por `vendor`, casando com o nome do
 * produtor. Se na sua loja a ligação for outra (uma coleção por produtor,
 * por exemplo), o ponto a mudar é só a variável `query` no loader.
 */

export async function loader({params, context, request}) {
  const {storefront} = context;
  const {handle} = params;

  const {metaobject} = await storefront.query(PRODUCER_QUERY, {
    variables: {handle, type: PRODUCER_METAOBJECT_TYPE},
    cache: storefront.CacheShort(),
  });

  if (!metaobject) {
    throw new Response('Produtor não encontrado', {status: 404});
  }

  const producer = toProducer(metaobject);

  const [{products}, {product: basketProduct}, itemsData] = await Promise.all([
    storefront.query(HORTA_PRODUCTS_QUERY, {
      variables: {
        first: 100,
        namespace: PRODUCT_PRODUCER_METAFIELD.namespace,
        key: PRODUCT_PRODUCER_METAFIELD.key,
      },
      cache: storefront.CacheShort(),
    }),
    storefront.query(BASKET_QUERY, {
      variables: {
        handle: BASKET_PRODUCT_HANDLE,
        identifiers: Object.values(BASKET_ITEM_METAFIELDS),
      },
      // Cache curto: a composição da cesta muda toda semana.
      cache: storefront.CacheShort(),
    }),
    storefront.query(ITEMS_QUERY, {
      variables: {type: ITEM_METAOBJECT_TYPE, first: 100},
      cache: storefront.CacheShort(),
    }).catch(() => ({metaobjects: null})),
  ]);

  /**
   * Catálogo da horta. Se o metaobject ainda não existir, a lista vem vazia
   * e a troca fica indisponível — mas a página continua funcionando.
   */
  const catalog = (itemsData?.metaobjects?.nodes ?? []).map(toItem);
  const baskets = toBaskets(basketProduct, catalog);

  /**
   * Ficam os produtos cujo metacampo `custom.produtor` aponta para este
   * produtor. Se o metacampo não estiver preenchido, a referência vem nula
   * e o produto fica de fora — melhor seção vazia do que produto de outra
   * horta na página errada.
   *
   * A cesta sai da lista: ela já tem o seletor P/M/G logo acima, e repetir
   * confunde.
   */
  const hortaProducts = (products?.nodes ?? []).filter(
    (product) =>
      product.producer?.reference?.handle === handle &&
      product.handle !== BASKET_PRODUCT_HANDLE,
  );

  return {
    producer,
    catalog,
    baskets,
    products: hortaProducts,
    shareUrl: new URL(request.url).href,
  };
}

export const meta = ({data}) => [
  {title: `${data?.producer?.name ?? 'Produtor'} | Urban Life`},
  {name: 'description', content: data?.producer?.description ?? ''},
];

function toProducer(node) {
  const byKey = new Map((node.fields ?? []).map((f) => [f.key, f]));

  const pick = (keys) => {
    for (const key of keys) {
      const value = byKey.get(key)?.value;
      if (value) return value;
    }
    return '';
  };

  const pickImage = (keys) => {
    for (const key of keys) {
      const image = byKey.get(key)?.reference?.image;
      if (image) return image;
    }
    return null;
  };

  const pickList = (keys) => {
    const raw = pick(keys);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
    } catch {
      return [raw];
    }
  };

  // A galeria mostra as fotos que existirem, sem repetir a mesma imagem.
  const gallery = [
    pickImage(PRODUCER_FIELDS.coverImage),
    pickImage(['foto_cultivo']),
    pickImage(PRODUCER_FIELDS.image),
  ].filter(Boolean);

  const seen = new Set();
  const images = gallery.filter((image) => {
    if (seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });

  const region = pick(PRODUCER_FIELDS.region);

  return {
    handle: node.handle,
    name: pick(PRODUCER_FIELDS.name) || node.handle,
    neighborhood: pick(PRODUCER_FIELDS.neighborhood),
    region,
    badge: pick(PRODUCER_FIELDS.badge) || (region ? `Produtor da ${region}` : ''),
    description: pick(PRODUCER_FIELDS.description),
    story: pick(PRODUCER_FIELDS.story),
    crops: pickList(PRODUCER_FIELDS.crops),
    images,
  };
}

/**
 * Converte as variantes do produto de cesta nos tamanhos do seletor.
 *
 * O título da variante vem como "Pequena (P)": o nome é o que está antes do
 * parêntese e a letra é o que está dentro. Ler daí, em vez de manter uma
 * lista fixa, faz um tamanho novo criado no Shopify aparecer sozinho.
 */
/** Converte um metaobject item_horta no formato que a página usa. */
function toItem(node) {
  const byKey = new Map((node.fields ?? []).map((f) => [f.key, f]));

  const pick = (keys) => {
    for (const key of keys) {
      const value = byKey.get(key)?.value;
      if (value) return value;
    }
    return '';
  };

  const available = pick(ITEM_FIELDS.available);

  return {
    id: node.id,
    name: pick(ITEM_FIELDS.name),
    unit: pick(ITEM_FIELDS.unit),
    group: pick(ITEM_FIELDS.group),
    price: Number.parseFloat(pick(ITEM_FIELDS.price)) || 0,
    // Booleano do Shopify chega como string.
    available: available === 'true' || available === '1',
    image:
      ITEM_FIELDS.image
        .map((key) => byKey.get(key)?.reference?.image)
        .find(Boolean) ?? null,
  };
}

/**
 * Converte as variantes do produto de cesta nos tamanhos do seletor.
 *
 * O título da variante vem como "Pequena (P)": o nome é o que está antes do
 * parêntese e a letra é o que está dentro. Ler daí, em vez de manter uma
 * lista fixa, faz um tamanho novo criado no Shopify aparecer sozinho.
 */
function toBaskets(product, catalog) {
  const variants = product?.variants?.nodes ?? [];
  const byName = new Map(catalog.map((item) => [normalize(item.name), item]));

  const keyToLetter = new Map(
    Object.entries(BASKET_ITEM_METAFIELDS).map(([letter, {key}]) => [
      key,
      letter,
    ]),
  );

  /**
   * Os metacampos da cesta aceitam dois formatos, de propósito:
   *
   *   referências a metaobject → o caminho certo, traz grupo e preço juntos
   *   lista de texto           → formato antigo, casado pelo nome no catálogo
   *
   * Manter os dois permite migrar os metacampos sem que a página quebre no
   * meio do caminho. Quando a migração terminar, o ramo do texto pode sair.
   */
  const itemsByLetter = {};
  for (const field of product?.metafields ?? []) {
    if (!field) continue;
    const letter = keyToLetter.get(field.key);
    if (!letter) continue;

    const referenced = field.references?.nodes ?? [];
    if (referenced.length > 0) {
      itemsByLetter[letter] = referenced.map(toItem);
      continue;
    }

    itemsByLetter[letter] = parseTextList(field.value).map((raw) => {
      // "Couve - 1 maço" -> nome "Couve", unidade "1 maço"
      const [namePart, ...unitParts] = raw.split(/\s+-\s+/);
      const name = namePart.trim();
      const known = byName.get(normalize(name));

      return {
        id: known?.id ?? `texto:${name}`,
        name,
        unit: unitParts.join(' - ').trim() || known?.unit || '',
        group: known?.group ?? '',
        price: known?.price ?? 0,
        available: known?.available ?? true,
        image: known?.image ?? null,
      };
    });
  }

  return variants
    .map((variant) => {
      const match = variant.title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (match ? match[1] : variant.title).trim();
      const letter = (match ? match[2] : variant.title.charAt(0)).trim();
      const meta = BASKET_SIZES[letter] ?? {order: 99, swaps: 0};
      const items = itemsByLetter[letter] ?? [];

      return {
        id: variant.id,
        variantId: variant.id,
        letter,
        name,
        order: meta.order,
        maxSwaps: meta.swaps,
        // A contagem é o tamanho da lista, não um número à parte: assim
        // "Contém 11 itens" nunca discorda dos itens listados abaixo.
        itemCount: items.length || null,
        items,
        price: variant.price,
        available: variant.availableForSale,
      };
    })
    .sort((a, b) => a.order - b.order);
}

function parseTextList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return raw.split(/[\u2022|\n]/);
  }
}

/** Casa nomes ignorando caixa, acento e espaço sobrando. */
function normalize(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ProducerDetail() {
  const {producer, baskets: basketList, products, shareUrl, catalog} =
    useLoaderData();
  const [selectedId, setSelectedId] = useState(basketList[0]?.id);

  const selected =
    basketList.find((b) => b.id === selectedId) ?? basketList[0] ?? null;

  return (
    <section className="ul-producer-page">
      <div className="ul-container ul-producer-page__grid">
        <div className="ul-producer-page__left">
          <UlProducerGallery images={producer.images} alt={producer.name} />
          <UlShareCard url={shareUrl} producerName={producer.name} />
        </div>

        <div className="ul-producer-page__right">
          <Link to="/pages/produtores" className="ul-producer-page__back">
            <UlIcon name="arrow-left" size={16} />
            {producerDetailUi.back}
          </Link>

          <h1 className="ul-producer-page__title">{producer.name}</h1>

          <p className="ul-producer-page__location">
            <UlIcon name="map-pin" size={15} />
            <span>
              {[producer.neighborhood, producer.region]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </p>

          {producer.badge && (
            <span className="ul-producer-page__badge">{producer.badge}</span>
          )}

          {producer.description && (
            <p className="ul-producer-page__description">
              {producer.description}
            </p>
          )}

          {selected && (
            <UlBasketPicker
              baskets={basketList}
              selected={selected}
              catalog={catalog}
              onSelect={setSelectedId}
              producerName={producer.name}
            />
          )}
        </div>
      </div>

      <div className="ul-container">
        <div className="ul-horta-products">
          <h2 className="ul-horta-products__title">
            <UlIcon name="sprout" size={20} />
            {producerDetailUi.productsTitle}
          </h2>

          {products.length === 0 ? (
            <p className="ul-horta-products__empty">
              Nenhum produto desta horta disponível no momento.
            </p>
          ) : (
            <div className="ul-horta-products__grid">
              {products.map((product) => (
                <UlHortaProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const IMAGE_FIELD_FRAGMENT = `#graphql
  fragment MetaobjectFields on Metaobject {
    handle
    fields {
      key
      value
      reference {
        ... on MediaImage {
          image { url altText width height }
        }
      }
    }
  }
`;

const PRODUCER_QUERY = `#graphql
  ${IMAGE_FIELD_FRAGMENT}
  query Producer($handle: String!, $type: String!) {
    metaobject(handle: {handle: $handle, type: $type}) {
      ...MetaobjectFields
    }
  }
`;

/**
 * Produtos da horta, filtrados por vendor. Se a ligação entre produto e
 * produtor for outra na sua loja, é esta variável `query` que muda.
 */
/**
 * Traz um lote de produtos com o metacampo do produtor e filtra em memória.
 *
 * Sem filtro de busca de propósito: o vínculo produto-produtor é uma
 * referência de metaobject, e a Storefront API não permite buscar por isso
 * na string de `query`. Filtrar por `vendor` não serve — a cesta e o pesto
 * têm vendor "Urban Life", não o nome da horta.
 *
 * Com catálogo pequeno isso é barato. Passando de algumas centenas de
 * produtos, vale criar uma coleção por produtor e consultar por ela.
 */
const HORTA_PRODUCTS_QUERY = `#graphql
  query HortaProducts($first: Int!, $namespace: String!, $key: String!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        availableForSale
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
        producer: metafield(namespace: $namespace, key: $key) {
          reference {
            ... on Metaobject { handle type }
          }
        }
      }
    }
  }
`;

/**
 * A cesta traz os itens de cada tamanho junto, num metacampo por tamanho.
 *
 * São campos do PRODUTO, não da variante — foi assim que a loja modelou.
 * Como são do tipo lista, o `value` vem como JSON em string.
 */
const BASKET_QUERY = `#graphql
  query Basket($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) {
      handle
      title
      metafields(identifiers: $identifiers) {
        key
        value
        references(first: 30) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image { url altText width height }
                  }
                }
              }
            }
          }
        }
      }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
        }
      }
    }
  }
`;

const ITEMS_QUERY = `#graphql
  query HortaItems($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image { url altText width height }
            }
          }
        }
      }
    }
  }
`;
