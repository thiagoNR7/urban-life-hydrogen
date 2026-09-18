import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';

/**
 * Galeria da horta: setas laterais, pontinhos e troca automática.
 *
 * O autoplay foi pedido em 18/09. Antes disso o componente era manual de
 * propósito — a ideia era que imagem trocando sozinha atrapalha quem está
 * lendo sobre o produtor. Se voltar a incomodar, é só pôr INTERVALO em 0
 * para desligar.
 *
 * 1,5s é bem mais rápido que os 5s do carrossel do hero. Trocar o número
 * abaixo é a única coisa necessária para ajustar.
 */
const INTERVALO = 1500;

export function UlProducerGallery({images, alt}) {
  const [active, setActive] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = images.length;

  /**
   * Pausa no hover e quando a aba sai de foco — girar em segundo plano só
   * gasta bateria. `prefers-reduced-motion` desliga de vez: troca automática
   * é movimento, e há quem precise evitar.
   */
  const reduzido = useRef(false);

  useEffect(() => {
    reduzido.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (total <= 1 || pausado || !INTERVALO || reduzido.current) {
      return undefined;
    }

    const id = setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, INTERVALO);

    return () => clearInterval(id);
  }, [total, pausado]);

  if (total === 0) {
    return <div className="ul-gallery ul-gallery--empty" />;
  }

  const go = (delta) => setActive((i) => (i + delta + total) % total);

  return (
    <div
      className="ul-gallery"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
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
