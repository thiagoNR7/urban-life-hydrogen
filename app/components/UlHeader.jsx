import {Suspense, useState} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';
import {UlIcon} from './UlIcon';
import {header} from '~/data/content';

/**
 * Cabeçalho.
 *
 * Layout em três colunas (ver ul-updates.css): logo à esquerda, menu centrado
 * na largura da tela, ações à direita. O `justify-content: space-between` do
 * tema distribuía os seis filhos igualmente, o que espalhava conta, carrinho e
 * CTA com vãos grandes entre eles. Agrupar as ações num container e usar grid
 * resolve, e mantém o menu centrado independente da largura da logo.
 *
 * A conta usa a promise `isLoggedIn` do root loader. Logada, mostra a inicial
 * num círculo escuro; deslogada, o ícone de usuário. As duas levam a /account,
 * que dispara o login da Shopify — é lá que o botão do Google aparece, se
 * estiver habilitado no admin.
 */
export function UlHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootData = useRouteLoaderData('root');
  const logoWidth = Math.round((header.logoHeight * 1914) / 2406);

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
              width={logoWidth}
              style={{
                '--ul-logo-height': `${header.logoHeight}px`,
                '--ul-logo-width': `${logoWidth}px`,
              }}
              loading="eager"
            />
          </Link>
        </div>

        <ul className="ul-header__menu ul-header__menu--desktop" role="list">
          {header.menu.map((item) => (
            <li className="ul-header__menu-item" key={item.href + item.label}>
              <a href={item.href} className="ul-header__menu-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ul-header__actions">
          {header.showAccount && (
            <Link
              to="/account"
              className="ul-header__account"
              aria-label="Minha conta"
            >
              <Suspense fallback={<UlIcon name="user" size={18} />}>
                <Await
                  resolve={rootData?.isLoggedIn}
                  errorElement={<UlIcon name="user" size={18} />}
                >
                  {(isLoggedIn) =>
                    isLoggedIn ? (
                      <span className="ul-header__account-initial">
                        {getInitial(rootData)}
                      </span>
                    ) : (
                      <UlIcon name="user" size={18} />
                    )
                  }
                </Await>
              </Suspense>
            </Link>
          )}

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
        </div>
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
            key={item.href + item.label}
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

/**
 * O root loader não expõe o nome do cliente, só se está logado. Até a
 * Customer Account API entrar, a inicial vem do nome da loja. Trocar por
 * `customer.firstName` quando a query de conta existir.
 */
function getInitial(rootData) {
  const name = rootData?.header?.shop?.name ?? 'Urban Life';
  return name.trim().charAt(0).toUpperCase();
}
