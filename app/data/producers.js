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

/**
 * Cestas da horta.
 *
 * Confirmado na Storefront API: é UM produto com três variantes —
 * "Pequena (P)", "Média (M)" e "Grande (G)" — e não três produtos.
 * O seletor P/M/G escolhe variante.
 */
export const BASKET_PRODUCT_HANDLE = 'cesta-semanal-de-hortalicas-teste';

/**
 * Metadados por tamanho: a letra do seletor e quantos itens a cesta leva.
 *
 * A chave é a letra que aparece entre parênteses no título da variante.
 * Se um tamanho novo for criado no Shopify sem entrada aqui, ele ainda
 * aparece no seletor — só sem a contagem de itens.
 *
 * A contagem de itens não está aqui de propósito: ela é o tamanho da lista
 * do metacampo. Assim "Contém 9 itens" nunca discorda dos itens mostrados.
 */
export const BASKET_SIZES = {
  P: {order: 1},
  M: {order: 2},
  G: {order: 3},
};

/**
 * Metacampos do produto de cesta.
 *
 * Confirmado no admin (Configurações → Metacampos e metaobjetos → Produtos).
 * As chaves são curtas: `itens_cesta_p`, não `itens_da_cesta_pequena`.
 *
 * O tipo é LISTA de texto de linha única, então a Storefront API entrega
 * JSON — `["Alface lisa","Couve"]`. O `•` que aparece no admin é só o
 * separador visual da interface, não faz parte do valor.
 */
export const BASKET_ITEM_METAFIELDS = {
  P: {namespace: 'custom', key: 'itens_cesta_p'},
  M: {namespace: 'custom', key: 'itens_cesta_m'},
  G: {namespace: 'custom', key: 'itens_cesta_g'},
};

/**
 * Como um produto se liga a um produtor.
 *
 * NÃO é por `vendor`: a cesta e o pesto têm vendor "Urban Life", não o nome
 * da horta. O admin mostra um metafield de produto do tipo "Um Produtor",
 * que referencia o metaobject — é esse o vínculo.
 *
 * Preencha com o namespace e a chave reais (Configurações → Metacampos e
 * metaobjetos → Produtos) para os "Produtos da Horta" filtrarem certo.
 */
export const PRODUCT_PRODUCER_METAFIELD = {
  namespace: 'custom',
  key: 'produtor',
};

/** Quantas trocas o cliente pode fazer numa cesta. */
export const SWAPS_ALLOWED = 1;

/** Rótulos da página de detalhe do produtor. */
export const producerDetailUi = {
  back: 'Voltar para Produtores',
  shareTitle: 'Divulgue esta horta',
  shareSubtitle: 'Ajude mais pessoas a conhecer esta produção.',
  copy: 'Copiar',
  copied: 'Copiado',
  share: 'Compartilhar horta',
  basketsTitle: 'Cestas da Horta',
  basketsSubtitle: 'Escolha o tamanho ideal para você.',
  containsPrefix: 'Contém',
  containsSuffix: 'itens desta semana',
  customizeTitle: 'Personalize sua cesta',
  customizeSubtitle:
    'Não gosta de algum item? Você pode fazer {n} troca.',
  swapLabel: 'Trocar',
  swapPlaceholder: 'Selecionar item',
  forLabel: 'Por',
  forPlaceholder: 'Selecionar substituto',
  available: 'Disponível',
  unavailable: 'Esgotado',
  chooseprefix: 'Escolher Cesta',
  productsTitle: 'Produtos da Horta',
  productLink: 'Ver produto',
  soldOut: 'Esgotado',
};
