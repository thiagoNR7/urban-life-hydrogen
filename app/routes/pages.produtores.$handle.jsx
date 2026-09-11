import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {UlIcon} from '~/components/UlIcon';
import {UlProducerGallery} from '~/components/UlProducerGallery';
import {UlShareCard} from '~/components/UlShareCard';
import {UlBasketPicker} from '~/components/UlBasketPicker';
import {UlHortaProductCard} from '~/components/UlHortaProductCard';
import {
  BASKET_ITEMS,
  BASKET_PRODUCT_HANDLE,
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

  const [{products}, {product: basketProduct}] = await Promise.all([
    storefront.query(HORTA_PRODUCTS_QUERY, {
      variables: {
        query: `vendor:'${producer.name}'`,
        first: 12,
        namespace: PRODUCT_PRODUCER_METAFIELD.namespace,
        key: PRODUCT_PRODUCER_METAFIELD.key,
      },
      cache: storefront.CacheShort(),
    }),
    storefront.query(BASKET_QUERY, {
      variables: {handle: BASKET_PRODUCT_HANDLE},
      cache: storefront.CacheShort(),
    }),
  ]);

  const baskets = toBaskets(basketProduct);

  /**
   * Os produtos da horta são os que apontam para este produtor pelo metafield.
   * A query traz um lote e o filtro acontece aqui, porque a Storefront API
   * não permite buscar por referência de metaobject na string de busca.
   *
   * Se o metafield ainda não estiver configurado, todos vêm com referência
   * nula e a seção aparece vazia — em vez de listar produtos errados.
   */
  const hortaProducts = (products?.nodes ?? []).filter(
    (product) => product.producer?.reference?.handle === handle,
  );

  return {
    producer,
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
function toBaskets(product) {
  const variants = product?.variants?.nodes ?? [];

  return variants
    .map((variant) => {
      const match = variant.title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (match ? match[1] : variant.title).trim();
      const letter = (match ? match[2] : variant.title.charAt(0)).trim();
      const meta = BASKET_SIZES[letter] ?? {order: 99, itemCount: null};

      return {
        id: variant.id,
        variantId: variant.id,
        letter,
        name,
        order: meta.order,
        itemCount: meta.itemCount,
        items: BASKET_ITEMS[letter] ?? [],
        price: variant.price,
        available: variant.availableForSale,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export default function ProducerDetail() {
  const {producer, baskets: basketList, products, shareUrl} = useLoaderData();
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
              onSelect={setSelectedId}
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
const HORTA_PRODUCTS_QUERY = `#graphql
  query HortaProducts(
    $query: String!
    $first: Int!
    $namespace: String!
    $key: String!
  ) {
    products(first: $first, query: $query) {
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

const BASKET_QUERY = `#graphql
  query Basket($handle: String!) {
    product(handle: $handle) {
      handle
      title
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
