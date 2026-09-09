import {useLoaderData} from 'react-router';
import {UlProductCard} from '~/components/UlProductCard';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';

/**
 * Página de coleção. Catálogo em cache longo — o que muda aqui é raro,
 * e é isso que faz um pico de acesso custar uma consulta em vez de mil.
 */

export async function loader({params, context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle: params.handle, first: 12, cursor},
    cache: storefront.CacheLong(),
  });

  if (!collection) throw new Response('Coleção não encontrada', {status: 404});

  return {collection};
}

export const meta = ({data}) => [
  {title: `${data?.collection?.title ?? 'Cestas'} | Urban Life`},
  {name: 'description', content: data?.collection?.description ?? ''},
];

export default function Collection() {
  const {collection} = useLoaderData();
  const products = collection.products.nodes;
  const {hasNextPage, endCursor} = collection.products.pageInfo;

  return (
    <section className="ul-collection">
      <div className="ul-container">
        <div className="ul-collection__intro">
          <span className="ul-eyebrow">Seleção da semana</span>
          <h1 className="ul-collection__heading">{collection.title}</h1>
          {collection.description && (
            <p className="ul-collection__subheading">{collection.description}</p>
          )}
        </div>

        {products.length === 0 ? (
          <p className="ul-collection__empty">
            Nenhuma cesta disponível nesta semana. Volte na segunda — a horta
            reabre a seleção toda semana.
          </p>
        ) : (
          <div className="ul-collection__grid">
            {products.map((product, i) => (
              <UlProductCard
                key={product.id}
                product={product}
                loading={i < 4 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="ul-collection__more">
            <a
              href={`?cursor=${endCursor}`}
              className="ul-btn ul-btn--outline ul-btn--lg"
            >
              Carregar mais
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $first: Int!
    $cursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      products(first: $first, after: $cursor) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
