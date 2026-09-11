import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {producerDetailUi} from '~/data/producers';

/** Card dos produtos da horta, na base da página do produtor. */
export function UlHortaProductCard({product}) {
  const soldOut = product.availableForSale === false;

  return (
    <article className="ul-horta-card">
      <div className="ul-horta-card__media">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="ul-horta-card__image"
          />
        ) : (
          <div className="ul-horta-card__placeholder">
            <UlIcon name="sprout" size={36} />
          </div>
        )}

        {soldOut && (
          <span className="ul-horta-card__badge">
            {producerDetailUi.soldOut}
          </span>
        )}
      </div>

      <div className="ul-horta-card__body">
        <h3 className="ul-horta-card__title">{product.title}</h3>
        <p className="ul-horta-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </p>
        <Link
          to={`/products/${product.handle}`}
          className="ul-horta-card__link"
        >
          {producerDetailUi.productLink}
          <UlIcon name="arrow-right" size={16} />
        </Link>
      </div>
    </article>
  );
}
