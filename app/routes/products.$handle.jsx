import {useState} from 'react';
import {useLoaderData} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {UlIcon} from '~/components/UlIcon';
import {useAside} from '~/components/Aside';

/**
 * Página de produto.
 *
 * Duas queries de propósito, com caches diferentes:
 *
 *   PRODUCT_QUERY  → CacheLong()   título, fotos, descrição
 *   STOCK_QUERY    → CacheShort()  disponibilidade e quantidade
 *
 * Se fosse uma query só, você escolheria entre servir estoque velho ou
 * bater no Shopify a cada visita. Separado, você tem os dois.
 */

export async function loader({params, context}) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) throw new Response('Produto não informado', {status: 404});

  const [{product}, {product: stock}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle},
      cache: storefront.CacheLong(),
    }),
    storefront.query(STOCK_QUERY, {
      variables: {handle},
      cache: storefront.CacheShort(),
    }),
  ]);

  if (!product) throw new Response('Produto não encontrado', {status: 404});

  // Junta o estoque fresco nas variantes do catálogo cacheado.
  const stockById = new Map(
    (stock?.variants?.nodes ?? []).map((v) => [v.id, v]),
  );
  const variants = product.variants.nodes.map((variant) => ({
    ...variant,
    ...stockById.get(variant.id),
  }));

  return {product: {...product, variants: {nodes: variants}}};
}

export const meta = ({data}) => [
  {title: `${data?.product?.title ?? 'Produto'} | Urban Life`},
  {name: 'description', content: data?.product?.seo?.description ?? ''},
];

export default function Product() {
  const {product} = useLoaderData();
  const {open} = useAside();
  const variants = product.variants.nodes;

  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id,
  );
  const [imageIndex, setImageIndex] = useState(0);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const images = product.images.nodes;
  const activeImage = images[imageIndex];
  const activeImageRatio =
    activeImage?.width && activeImage?.height
      ? `${activeImage.width}/${activeImage.height}`
      : '4/5';
  const lowStock =
    selected?.quantityAvailable != null &&
    selected.quantityAvailable > 0 &&
    selected.quantityAvailable <= 5;

  return (
    <section className="ul-product">
      <div className="ul-container ul-product__grid">
        <div className="ul-product__media">
          <div className="ul-product__frame">
            {activeImage && (
              <Image
                data={activeImage}
                aspectRatio={activeImageRatio}
                sizes="(min-width: 1024px) 45vw, 100vw"
                loading="eager"
                className="ul-product__image"
              />
            )}
          </div>

          {images.length > 1 && (
            <div className="ul-product__thumbs">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  type="button"
                  className={`ul-product__thumb${
                    i === imageIndex ? ' ul-product__thumb--active' : ''
                  }`}
                  aria-label={`Ver imagem ${i + 1}`}
                  onClick={() => setImageIndex(i)}
                >
                  <Image data={image} aspectRatio="1/1" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ul-product__info">
          <span className="ul-badge">
            <UlIcon name="leaf" size={14} />
            {product.vendor || 'Urban Life'}
          </span>

          <h1 className="ul-product__title">{product.title}</h1>

          <p className="ul-product__price">
            <Money data={selected.price} />
            {selected.compareAtPrice && (
              <s className="ul-product__compare">
                <Money data={selected.compareAtPrice} />
              </s>
            )}
          </p>

          {variants.length > 1 && (
            <div className="ul-product__variants">
              <p className="ul-product__variants-label">Escolha o tamanho</p>
              <div className="ul-product__variant-list">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.availableForSale}
                    aria-pressed={variant.id === selectedId}
                    className={`ul-product__variant${
                      variant.id === selectedId
                        ? ' ul-product__variant--active'
                        : ''
                    }`}
                    onClick={() => setSelectedId(variant.id)}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lowStock && (
            <p className="ul-product__low-stock">
              <UlIcon name="clock" size={14} />
              Restam apenas {selected.quantityAvailable} — a horta reserva por
              ordem de pedido.
            </p>
          )}

          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesAdd}
            inputs={{lines: [{merchandiseId: selectedId, quantity: 1}]}}
          >
            <button
              type="submit"
              className="ul-btn ul-btn--solid ul-btn--lg ul-product__add"
              disabled={!selected?.availableForSale}
              onClick={() => {
                if (selected?.availableForSale) open('cart');
              }}
            >
              {selected?.availableForSale
                ? 'Adicionar à cesta'
                : 'Esgotado nesta semana'}
              {selected?.availableForSale && (
                <UlIcon name="arrow-right" size={16} />
              )}
            </button>
          </CartForm>

          <div className="ul-product__delivery">
            <UlIcon name="truck" size={16} />
            <span>
              Entrega programada por região. O dia depende da sua zona — veja as{' '}
              <a href="/#produtores" className="ul-regions__contact-link">
                zonas atendidas
              </a>
              .
            </span>
          </div>

          {product.descriptionHtml && (
            <div
              className="ul-product__description"
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          )}
        </div>
      </div>
    </section>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      images(first: 6) {
        nodes { id url altText width height }
      }
      variants(first: 20) {
        nodes {
          id
          title
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
      seo { title description }
    }
  }
`;

const STOCK_QUERY = `#graphql
  query ProductStock($handle: String!) {
    product(handle: $handle) {
      variants(first: 20) {
        nodes {
          id
          availableForSale
          quantityAvailable
        }
      }
    }
  }
`;
