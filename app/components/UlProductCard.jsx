import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

/**
 * Card de produto no visual da Urban Life.
 *
 * Usa <Image> do Hydrogen em vez de <img>: ele gera srcset a partir do CDN
 * do Shopify, então a foto de 2000px que você subiu no admin não é baixada
 * inteira num celular.
 */
export function UlProductCard({product, loading = 'lazy'}) {
  const price = product.priceRange?.minVariantPrice;
  const soldOut = product.availableForSale === false;

  return (
    <Link to={`/products/${product.handle}`} className="ul-product-card">
      <div className="ul-product-card__media">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="4/5"
            sizes="(min-width: 1024px) 25vw, 50vw"
            loading={loading}
            className="ul-product-card__image"
          />
        ) : (
          <div className="ul-product-card__image ul-product-card__image--empty" />
        )}
        {soldOut && <span className="ul-product-card__badge">Esgotado</span>}
      </div>

      <div className="ul-product-card__body">
        <h3 className="ul-product-card__title">{product.title}</h3>
        {price && (
          <p className="ul-product-card__price">
            <Money data={price} />
          </p>
        )}
      </div>
    </Link>
  );
}
