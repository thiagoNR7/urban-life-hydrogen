import {useMemo, useState} from 'react';
import {useLoaderData} from 'react-router';
import {UlIcon} from '~/components/UlIcon';
import {UlProducerCard} from '~/components/UlProducerCard';
import {UlProducerModal} from '~/components/UlProducerModal';
import {
  PRODUCER_FIELDS,
  PRODUCER_METAOBJECT_TYPE,
  producerUrl,
  producersPage,
  producersUi,
} from '~/data/producers';

/**
 * /pages/produtores
 *
 * Esta rota tem precedência sobre `pages.$handle.jsx` do esqueleto, que
 * renderiza páginas comuns do Shopify. É proposital: a página de produtores
 * não é conteúdo de página, é uma listagem de metaobjects com filtro.
 *
 * Os filtros rodam no cliente. Com dezenas de produtores isso é mais rápido
 * e mais simples do que refazer a query a cada tecla — e a lista inteira já
 * veio no primeiro carregamento. Se um dia passar de umas centenas, aí sim
 * vale mover para o servidor com paginação.
 */

export async function loader({context}) {
  const {storefront} = context;

  const {metaobjects} = await storefront.query(PRODUCERS_QUERY, {
    variables: {type: PRODUCER_METAOBJECT_TYPE, first: 100},
    cache: storefront.CacheShort(),
  });

  const producers = (metaobjects?.nodes ?? []).map(toProducer);

  return {producers};
}

export const meta = () => [
  {title: 'Produtores parceiros | Urban Life'},
  {name: 'description', content: producersPage.subheading},
];

/**
 * Converte o metaobject cru — uma lista de {key, value} — num objeto com os
 * nomes que o card espera, usando o mapeamento de PRODUCER_FIELDS.
 */
function toProducer(node) {
  const byKey = new Map((node.fields ?? []).map((f) => [f.key, f]));

  const pick = (candidates) => {
    for (const key of candidates) {
      const field = byKey.get(key);
      if (field?.value) return field.value;
    }
    return '';
  };

  const pickImage = (candidates) => {
    for (const key of candidates) {
      const image = byKey.get(key)?.reference?.image;
      if (image) return image;
    }
    return null;
  };

  /**
   * Campos de lista do Shopify chegam como JSON em string, tipo
   * '["Alface","Couve"]'. Se um dia virar texto simples, o catch devolve
   * o valor inteiro como item único em vez de quebrar a página.
   */
  const pickList = (candidates) => {
    const raw = pick(candidates);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((s) => String(s).trim()).filter(Boolean)
        : [String(parsed).trim()];
    } catch {
      return [raw.trim()];
    }
  };

  const agro = pick(PRODUCER_FIELDS.agroecological);
  const region = pick(PRODUCER_FIELDS.region);

  return {
    id: node.id,
    handle: node.handle,
    name: pick(PRODUCER_FIELDS.name) || node.handle,
    horta: pick(PRODUCER_FIELDS.horta),
    neighborhood: pick(PRODUCER_FIELDS.neighborhood),
    region,
    // selo_origem já vem escrito por extenso ("Produtor da Zona Norte"), então
    // é ele que manda. A concatenação abaixo é só rede de segurança.
    badge: pick(PRODUCER_FIELDS.badge) || (region ? `Produtor da ${region}` : ''),
    description: pick(PRODUCER_FIELDS.description),
    story: pick(PRODUCER_FIELDS.story) || pick(PRODUCER_FIELDS.description),
    crops: pickList(PRODUCER_FIELDS.crops),
    practices: pickList(PRODUCER_FIELDS.practices),
    whatsapp: pick(PRODUCER_FIELDS.whatsapp),
    image: pickImage(PRODUCER_FIELDS.image),
    coverImage: pickImage(PRODUCER_FIELDS.coverImage),
    catalogUrl: producerUrl(node.handle),
    // Booleano do Shopify chega como a string "true".
    agroecological: agro === 'true' || agro === '1',
  };
}

export default function Produtores() {
  const {producers} = useLoaderData();

  const [term, setTerm] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [crop, setCrop] = useState('');
  const [onlyAgro, setOnlyAgro] = useState(false);
  const [selected, setSelected] = useState(null);

  const neighborhoods = useMemo(
    () => unique(producers.map((p) => p.neighborhood)),
    [producers],
  );
  // Cada produtor tem vários cultivos, então a lista do select é a união de
  // todos eles — não um valor por produtor.
  const crops = useMemo(
    () => unique(producers.flatMap((p) => p.crops)),
    [producers],
  );

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();

    return producers.filter((producer) => {
      if (onlyAgro && !producer.agroecological) return false;
      if (neighborhood && producer.neighborhood !== neighborhood) return false;
      // Inclusão, não igualdade: o produtor casa se o cultivo escolhido
      // estiver entre os dele.
      if (crop && !producer.crops.includes(crop)) return false;

      if (!needle) return true;
      return [producer.name, producer.horta, producer.neighborhood]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [producers, term, neighborhood, crop, onlyAgro]);

  const hasFilters = Boolean(term || neighborhood || crop || onlyAgro);

  function clearFilters() {
    setTerm('');
    setNeighborhood('');
    setCrop('');
    setOnlyAgro(false);
  }

  return (
    <section className="ul-producers">
      <div className="ul-container">
        <div className="ul-producers__intro">
          <span className="ul-eyebrow">{producersPage.eyebrow}</span>
          <h1 className="ul-producers__heading">{producersPage.heading}</h1>
          <p className="ul-producers__subheading">{producersPage.subheading}</p>
        </div>

        <div className="ul-producers__panel">
          <div className="ul-producers__search">
            <UlIcon name="search" size={20} />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={producersUi.searchPlaceholder}
              aria-label={producersUi.searchPlaceholder}
            />
          </div>

          <div className="ul-producers__filters">
            <div className="ul-producers__field">
              <label htmlFor="ul-filter-bairro">
                {producersUi.neighborhoodLabel}
              </label>
              <select
                id="ul-filter-bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              >
                <option value="">{producersUi.neighborhoodAll}</option>
                {neighborhoods.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="ul-producers__field">
              <label htmlFor="ul-filter-cultivo">{producersUi.cropLabel}</label>
              <select
                id="ul-filter-cultivo"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                <option value="">{producersUi.cropAll}</option>
                {crops.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <label className="ul-producers__toggle">
              <input
                type="checkbox"
                checked={onlyAgro}
                onChange={(e) => setOnlyAgro(e.target.checked)}
              />
              <span>{producersUi.agroecologicalLabel}</span>
            </label>

            <button
              type="button"
              className="ul-btn ul-btn--cream ul-producers__clear"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              {producersUi.clearFilters}
            </button>
          </div>
        </div>

        <p className="ul-producers__count" role="status" aria-live="polite">
          {filtered.length}{' '}
          {filtered.length === 1 ? producersUi.countOne : producersUi.countMany}
        </p>

        {filtered.length === 0 ? (
          <p className="ul-producers__empty">{producersUi.empty}</p>
        ) : (
          <div className="ul-producers__grid">
            {filtered.map((producer) => (
              <UlProducerCard
                key={producer.id}
                producer={producer}
                onOpen={() => setSelected(producer)}
              />
            ))}
          </div>
        )}
      </div>

      <UlProducerModal producer={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
}

/**
 * Traz os campos genericamente em vez de nomeá-los na query.
 *
 * Assim o GraphQL não precisa saber como os campos se chamam no seu
 * metaobject — o mapeamento acontece em JS, em PRODUCER_FIELDS. Se o nome de
 * um campo mudar no admin, nada aqui quebra.
 */
const PRODUCERS_QUERY = `#graphql
  query Producers($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;
