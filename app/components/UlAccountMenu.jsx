import {useEffect, useRef, useState} from 'react';
import {UlIcon} from './UlIcon';

/**
 * Menu de conta do cabeçalho.
 *
 * Replica o comportamento da produção: o avatar abre um popover com a
 * saudação, o e-mail e dois atalhos. Os atalhos levam para as páginas de
 * conta hospedadas pela Shopify (shopify.com/{shopId}/account), e não para
 * rotas do próprio site — é o que a loja em produção faz.
 *
 * Os dados vêm de /account/me, buscados só na primeira abertura.
 */
export function UlAccountMenu() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Busca uma vez, na primeira vez que abrir.
  useEffect(() => {
    if (!open || data || loading) return;
    setLoading(true);
    fetch('/account/me')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({loggedIn: false, accountUrl: '/account'}))
      .finally(() => setLoading(false));
  }, [open, data, loading]);

  // Fecha ao clicar fora ou apertar Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initial = (data?.firstName || 'U').trim().charAt(0).toUpperCase();
  const accountUrl = data?.accountUrl ?? '/account';

  return (
    <div className="ul-account" ref={ref}>
      <button
        type="button"
        className="ul-account__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Minha conta"
        onClick={() => setOpen((v) => !v)}
      >
        {data?.loggedIn ? (
          <span className="ul-account__initial">{initial}</span>
        ) : (
          <UlIcon name="user" size={18} />
        )}
      </button>

      {open && (
        <div className="ul-account__popover" role="menu">
          {loading && <p className="ul-account__loading">Carregando...</p>}

          {!loading && data?.loggedIn && (
            <>
              <p className="ul-account__greeting">
                Olá, {data.firstName || 'cliente'}
              </p>
              {data.email && <p className="ul-account__email">{data.email}</p>}

              <div className="ul-account__actions">
                <a
                  href={`${accountUrl}/orders`}
                  className="ul-account__action"
                  role="menuitem"
                >
                  <UlIcon name="package" size={16} />
                  Pedidos
                </a>
                <a
                  href={`${accountUrl}/profile`}
                  className="ul-account__action"
                  role="menuitem"
                >
                  <UlIcon name="user" size={16} />
                  Perfil
                </a>
              </div>
            </>
          )}

          {!loading && data && !data.loggedIn && (
            <>
              <p className="ul-account__greeting">Bem-vindo</p>
              <p className="ul-account__email">
                Entre para acompanhar seus pedidos.
              </p>
              <div className="ul-account__actions">
                <a
                  href="/account"
                  className="ul-account__action ul-account__action--solid"
                  role="menuitem"
                >
                  Entrar
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
