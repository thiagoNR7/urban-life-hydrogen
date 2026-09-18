import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {TIPOS} from '~/routes/collections.all';

/**
 * Card da página "Produtos em destaque".
 *
 * Existe separado de `UlProductCard` e `UlHortaProductCard` porque aqui o
 * card precisa identificar a horta — é o que a página promete no subtítulo
 * ("escolha de qual horta você quer comprar") e o que os outros dois não
 * mostram.
 *
 * AINDA NÃO TEM, e a produção tem: as pílulas P/M/G e a prévia da composição
 * dentro do card. Dependem dos metafields `custom.itens_cesta_p/m/g`, que são
 * do produto e vêm como JSON em string — consulta a mais e estado por card.
 */
export function UlDestaqueCard({product, loading = 'lazy'}) {
  const esgotado = product.availableForSale === false;
  const produtor = product.produtor;
  const local = [produtor?.neighborhood, produtor?.region]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="ul-destaque-card">
      <div className="ul-destaque-card__media">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="4/5"
            sizes="(min-width: 1024px) 25vw, 50vw"
            loading={loading}
            className="ul-destaque-card__image"
          />
        ) : (
          <div className="ul-destaque-card__placeholder">
            <UlIcon name="sprout" size={36} />
          </div>
        )}

        {/* O valor gravado é de máquina (`cesta`, `produto_especial`); o
            rótulo vem do mapa. Valor novo sem rótulo aparece cru, o que é
            melhor que sumir. */}
        {product.tipo ? (
          <span className="ul-destaque-card__tipo">
            {TIPOS[product.tipo] ?? product.tipo}
          </span>
        ) : null}

        {esgotado && (
          <span className="ul-destaque-card__esgotado">Esgotado</span>
        )}
      </div>

      <div className="ul-destaque-card__body">
        {produtor?.name ? (
          <p className="ul-destaque-card__horta">
            <UlIcon name="leaf" size={14} />
            {produtor.name}
          </p>
        ) : null}

        {local ? (
          <p className="ul-destaque-card__local">
            <UlIcon name="pin" size={14} />
            {local}
          </p>
        ) : null}

        <h3 className="ul-destaque-card__title">{product.title}</h3>

        <div className="ul-destaque-card__rodape">
          <p className="ul-destaque-card__preco">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
          <span
            className={`ul-destaque-card__estoque${
              esgotado ? ' is-out' : ''
            }`}
          >
            {esgotado ? 'Esgotado' : 'Disponível'}
          </span>
        </div>

        <Link
          className="ul-btn ul-btn--solid ul-destaque-card__cta"
          to={
            produtor?.handle
              ? `/pages/produtores/${produtor.handle}`
              : `/products/${product.handle}`
          }
          prefetch="intent"
        >
          {produtor?.handle ? 'Ver na horta' : 'Ver produto'}
          <UlIcon name="arrow-right" size={16} />
        </Link>
      </div>
    </article>
  );
}

export default UlDestaqueCard;
