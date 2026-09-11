import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';

/**
 * Galeria da horta: setas laterais e pontinhos.
 *
 * Sem autoplay de propósito — diferente do hero. Aqui o visitante está lendo
 * sobre um produtor específico, e a imagem trocar sozinha atrapalha.
 */
export function UlProducerGallery({images, alt}) {
  const [active, setActive] = useState(0);
  const total = images.length;

  if (total === 0) {
    return <div className="ul-gallery ul-gallery--empty" />;
  }

  const go = (delta) => setActive((i) => (i + delta + total) % total);

  return (
    <div className="ul-gallery">
      {images.map((image, i) => (
        <div
          key={image.url}
          className={`ul-gallery__slide${
            i === active ? ' ul-gallery__slide--active' : ''
          }`}
          aria-hidden={i !== active}
        >
          <Image
            data={image}
            sizes="(min-width: 1024px) 55vw, 100vw"
            loading={i === 0 ? 'eager' : 'lazy'}
            className="ul-gallery__image"
            alt={image.altText || alt}
          />
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            className="ul-gallery__arrow ul-gallery__arrow--prev"
            onClick={() => go(-1)}
            aria-label="Imagem anterior"
          >
            <UlIcon name="arrow-left" size={20} />
          </button>

          <button
            type="button"
            className="ul-gallery__arrow ul-gallery__arrow--next"
            onClick={() => go(1)}
            aria-label="Próxima imagem"
          >
            <UlIcon name="arrow-right" size={20} />
          </button>

          <div className="ul-gallery__dots" role="tablist" aria-label="Fotos">
            {images.map((image, i) => (
              <button
                key={image.url}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Foto ${i + 1}`}
                className={`ul-gallery__dot${
                  i === active ? ' ul-gallery__dot--active' : ''
                }`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
