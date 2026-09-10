import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {UlIcon} from './UlIcon';
import {hero} from '~/data/content';

/**
 * Porte de sections/ul-hero.liquid + assets/ul-hero.js.
 *
 * O `<ul-hero-component>` (custom element com refs e on:click="/select/N")
 * vira estado React. O destaque colorido do título, que no Liquid era um
 * `replace` de string, vira split — mais seguro, porque não injeta HTML.
 */

function Heading({text, highlight}) {
  if (!highlight || !text.includes(highlight)) {
    return <h1 className="ul-hero__heading">{text}</h1>;
  }
  const [before, ...rest] = text.split(highlight);
  return (
    <h1 className="ul-hero__heading">
      {before}
      <span className="ul-hero__highlight">{highlight}</span>
      {rest.join(highlight)}
    </h1>
  );
}

const AUTOPLAY_INTERVAL_MS = 2500;

export function UlHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const {images, avatars} = hero;

  // Autoplay de 5s, igual ao setInterval do ul-hero.js do tema (que por sua
  // vez replicava o do React original). Tinha ficado de fora no porte.
  //
  // Duas diferenças conscientes em relação ao tema:
  //  - pausa no hover e no foco, para quem estiver lendo ou navegando pelo
  //    teclado não ver a imagem trocar embaixo do cursor
  //  - respeita prefers-reduced-motion, parando o giro automático
  useEffect(() => {
    if (images.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      AUTOPLAY_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [images.length, paused]);

  return (
    <section className="ul-hero">
      <div className="ul-container">
        <div className="ul-hero__grid">
          <div className="ul-hero__text">
            {hero.badgeText && (
              <span className="ul-badge ul-hero__badge">
                <UlIcon name="leaf" size={14} />
                {hero.badgeText}
              </span>
            )}

            <Heading text={hero.heading} highlight={hero.headingHighlight} />

            {hero.subheading && (
              <p className="ul-hero__subheading">{hero.subheading}</p>
            )}

            <div className="ul-hero__actions">
              {hero.buttonLabel && (
                <Link
                  to={hero.buttonLink}
                  className="ul-btn ul-btn--solid ul-btn--lg"
                >
                  {hero.buttonLabel}
                  <UlIcon name="arrow-right" size={16} />
                </Link>
              )}
              {hero.buttonLabel2 && (
                <a
                  href={hero.buttonLink2}
                  className="ul-btn ul-btn--cream ul-btn--lg"
                >
                  {hero.buttonLabel2}
                </a>
              )}
            </div>

            {avatars.length > 0 && (
              <div className="ul-hero__social">
                <div className="ul-hero__avatars">
                  {avatars.map((avatar, i) => (
                    <span
                      key={i}
                      className="ul-hero__avatar"
                      style={{backgroundColor: avatar.color}}
                    >
                      {avatar.initial}
                    </span>
                  ))}
                </div>
                <p className="ul-hero__social-text">
                  <strong>{hero.socialProofCount}</strong> {hero.socialProofText}
                </p>
              </div>
            )}
          </div>

          <div className="ul-hero__media">
            <div
              className="ul-hero__frame"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
              role="group"
              aria-roledescription="carousel"
              aria-label={hero.heading}
            >
              {images.map((image, i) => (
                <div
                  key={i}
                  className={`ul-hero__slide${
                    i === active ? ' ul-hero__slide--active' : ''
                  }`}
                  aria-hidden={i !== active}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="ul-hero__image"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    width="800"
                    height="1000"
                  />
                </div>
              ))}

              <div className="ul-hero__overlay" aria-hidden="true" />

              {hero.mediaLabel ? (
                <div className="ul-hero__label">
                  <p>{hero.mediaLabel}</p>
                </div>
              ) : null}
            </div>

            {images.length > 1 && (
              <div
                className="ul-hero__dots"
                role="tablist"
                aria-label="Selecionar imagem do carrossel"
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ul-hero__dot${
                      i === active ? ' ul-hero__dot--active' : ''
                    }`}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Ir para a imagem ${i + 1}`}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
