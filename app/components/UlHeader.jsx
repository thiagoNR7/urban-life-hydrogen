import {Suspense, useState} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {UlIcon} from './UlIcon';
import {header} from '~/data/content';

/**
 * Porte de sections/ul-header.liquid + assets/ul-header.js.
 *
 * Duas coisas que mudam em relação ao tema:
 *
 * 1. O contador do carrinho vinha de `cart.item_count`, um valor de servidor
 *    que só atualizava com reload. Aqui vem da promise `cart` do root loader,
 *    então muda sozinho quando o cliente adiciona um item.
 *
 * 2. O menu mobile no tema usava `inert` + classes. Aqui é estado React, mas
 *    mantendo os mesmos atributos ARIA e a mesma classe --open, para o CSS
 *    portado continuar valendo sem alteração.
 */
export function UlHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootData = useRouteLoaderData('root');

  return (
    <div className="ul-header">
      <nav className="ul-header__navbar" aria-label="Menu principal">
        <div className="ul-header__brand">
          <Link to="/" className="ul-header__logo-link">
            <img
              src="/images/ul-logo.png"
              alt="Urban Life"
              className="ul-header__logo"
              height={header.logoHeight}
              width={Math.round((header.logoHeight * 1914) / 2406)}
              style={{
                '--ul-logo-height': `${header.logoHeight}px`,
                '--ul-logo-width': `${Math.round(
                  (header.logoHeight * 1914) / 2406,
                )}px`,
              }}
              loading="eager"
            />
          </Link>
        </div>

        <ul className="ul-header__menu ul-header__menu--desktop" role="list">
          {header.menu.map((item) => (
            <li className="ul-header__menu-item" key={item.href}>
              <a href={item.href} className="ul-header__menu-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <Link to="/cart" className="ul-header__cart-link" aria-label="Carrinho">
          <UlIcon name="cart" size={20} className="ul-header__cart-icon" />
          <Suspense fallback={null}>
            <Await resolve={rootData?.cart} errorElement={null}>
              {(cart) =>
                cart?.totalQuantity > 0 ? (
                  <span className="ul-header__cart-count">
                    {cart.totalQuantity}
                  </span>
                ) : null
              }
            </Await>
          </Suspense>
        </Link>

        <Link
          to={header.producerCta.href}
          className="ul-btn ul-btn--solid ul-btn--sm ul-header__producer-cta"
        >
          <UlIcon name={header.producerCta.icon} size={16} />
          {header.producerCta.label}
        </Link>

        <button
          type="button"
          className="ul-header__hamburger"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="UlHeaderMobileMenu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="ul-header__hamburger-bar" />
          <span className="ul-header__hamburger-bar" />
          <span className="ul-header__hamburger-bar" />
        </button>
      </nav>

      <div
        id="UlHeaderMobileMenu"
        className={`ul-header__mobile-menu${
          menuOpen ? ' ul-header__mobile-menu--open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : ''}
      >
        {header.menu.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="ul-header__mobile-menu-link"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <Link
          to={header.producerCta.href}
          className="ul-header__mobile-menu-link ul-header__mobile-menu-link--cta"
          onClick={() => setMenuOpen(false)}
        >
          <UlIcon name={header.producerCta.icon} size={16} />
          {header.producerCta.label}
        </Link>
      </div>
    </div>
  );
}
