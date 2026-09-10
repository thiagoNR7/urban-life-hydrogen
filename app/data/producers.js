/**
 * Página de produtores.
 *
 * O mapeamento abaixo foi conferido contra a definição real no admin
 * (Metacampos e metaobjetos → Produtor) e contra o retorno da Storefront API.
 * Não é chute.
 */

/**
 * Handle do tipo do metaobject.
 *
 * Repare que não é "produtor": ao criar a definição, o Shopify gera um handle
 * que pode levar sufixo. O valor real aparece na URL do admin e logo abaixo
 * do nome, em "Tipo:".
 */
export const PRODUCER_METAOBJECT_TYPE = 'produtor_luis';

/**
 * De qual campo sai cada informação.
 *
 * Cada entrada é uma lista: usa o primeiro campo que existir. O primeiro nome
 * é o real hoje; os seguintes são tolerância para renomeações futuras.
 */
export const PRODUCER_FIELDS = {
  name: ['nome', 'name'],
  horta: ['nome_horta', 'horta'],
  neighborhood: ['bairro', 'neighborhood'],
  region: ['regiao', 'zona', 'region'],
  badge: ['selo_origem', 'selo'],
  description: ['descricao_curta', 'descricao', 'historia'],
  story: ['historia', 'descricao_curta'],
  image: ['foto_card', 'foto_capa', 'foto_perfil', 'imagem'],
  coverImage: ['foto_capa', 'foto_cultivo', 'foto_card'],
  crops: ['principais_cultivos', 'cultivos'],
  practices: ['praticas_sustentaveis', 'praticas'],
  agroecological: ['agroecologico', 'agroecological'],
  yearsOfExperience: ['anos_experiencia'],
  whatsapp: ['whatsapp', 'telefone'],
};

/**
 * O metaobject está publicado na loja com o identificador "produtores", então
 * cada entrada ganha página em /pages/produtores/{handle} — foi o exemplo que
 * o próprio admin mostrou. É para lá que o "Ver catálogo" aponta.
 *
 * Se o destino certo for outro (uma coleção do produtor, por exemplo), troque
 * só esta função.
 */
export function producerUrl(handle) {
  return `/pages/produtores/${handle}`;
}

/** Texto da introdução, que ocupa a área acima dos filtros. */
export const producersPage = {
  eyebrow: 'Rede de produtores',
  heading: 'Quem planta o que você come',
  subheading:
    'Cada cesta sai de uma horta urbana de São Paulo com nome, endereço e história. Conheça os produtores parceiros e veja o catálogo de cada um.',
};

/** Rótulos da interface, num lugar só para facilitar ajuste. */
export const producersUi = {
  searchPlaceholder: 'Buscar por nome, horta ou bairro',
  neighborhoodLabel: 'Bairro',
  neighborhoodAll: 'Todos os bairros',
  cropLabel: 'Tipo de cultivo',
  cropAll: 'Todos os cultivos',
  agroecologicalLabel: 'Agroecológico',
  clearFilters: 'Limpar filtros',
  catalogLabel: 'Ver catálogo',
  productsLabel: 'Ver Produtos',
  countOne: 'produtor encontrado',
  countMany: 'produtores encontrados',
  empty: 'Nenhum produtor encontrado com esses filtros.',
};
