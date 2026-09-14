import {useState} from 'react';
import {data, useLoaderData, Link} from 'react-router';
import {CartForm, useOptimisticCart} from '@shopify/hydrogen';

/**
 * Carrinho da Urban Life.
 *
 * Porte do carrinho do tema em produção (urban-life-9kcxhllo.myshopify.com/cart).
 * Layout medido a partir de captura, NAO do DOM — os valores marcados com
 * "// medir" em ul-cart.css ainda precisam passar pela conferencia com
 * getBoundingClientRect/getComputedStyle contra a producao.
 *
 * O `redirectTo` na action e o que permite que o botao "Escolher Cesta"
 * da pagina do produtor caia aqui em vez de sair para o dominio myshopify.
 */

export const meta = () => [{title: 'Urban Life | Seu carrinho'}];

export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();
  const {action: cartAction, inputs} = CartForm.getFormInput(formData);

  if (!cartAction) {
    throw new Error('Nenhuma acao de carrinho foi informada no formulario.');
  }

  let status = 200;
  let result;

  switch (cartAction) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];
      discountCodes.push(...(inputs.discountCodes ?? []));
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate:
      result = await cart.updateBuyerIdentity({...inputs.buyerIdentity});
      break;
    default:
      throw new Error(`Acao de carrinho nao tratada: ${cartAction}`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(cartId) : new Headers();

  // A pagina do produtor manda redirectTo=/cart junto com o LinesAdd.
  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: result?.cart,
      errors: result?.errors,
      warnings: result?.warnings,
    },
    {status, headers},
  );
}

export async function loader({context}) {
  return await context.cart.get();
}

/* ------------------------------------------------------------------ */
/* Formato de preco                                                    */
/* ------------------------------------------------------------------ */

/**
 * Formata sempre em pt-BR, independente do `language`/`country` do i18n
 * do esqueleto. Enquanto a correcao de `language: 'EN', country: 'US'`
 * nao for confirmada, <Money> ainda devolve "R$3.00" — por isso aqui nao
 * usamos <Money>.
 */
const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function money(amount) {
  if (!amount?.amount) return null;
  return BRL.format(Number(amount.amount));
}

function moneyWithCode(amount) {
  const value = money(amount);
  if (!value) return null;
  return `${value} ${amount.currencyCode ?? 'BRL'}`;
}

/* ------------------------------------------------------------------ */
/* Pagina                                                              */
/* ------------------------------------------------------------------ */

export default function Cart() {
  const originalCart = useLoaderData();
  const cart = useOptimisticCart(originalCart);

  const lines = cart?.lines?.nodes ?? [];
  const count = lines.reduce((total, line) => total + (line.quantity ?? 0), 0);
  const isEmpty = lines.length === 0;

  return (
    <div className="ul-cart">
      <div className="ul-cart-inner">
        <header className="ul-cart-head">
          <h1 className="ul-cart-title">Seu carrinho</h1>
          <p className="ul-cart-sub">Revise suas cestas antes de continuar.</p>
          {!isEmpty && (
            <p className="ul-cart-count">
              {count === 1 ? '1 item no carrinho' : `${count} itens no carrinho`}
            </p>
          )}
        </header>

        {isEmpty ? (
          <CartEmpty />
        ) : (
          <div className="ul-cart-grid">
            <ul className="ul-cart-lines">
              {lines.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </ul>
            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </div>
  );
}

function CartEmpty() {
  return (
    <div className="ul-cart-empty">
      <p className="ul-cart-empty-text">
        Ainda nao ha nenhuma cesta aqui. Escolha uma horta e monte a cesta da
        semana.
      </p>
      <Link className="ul-cart-empty-link" to="/pages/produtores">
        Ver as hortas
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Linha                                                               */
/* ------------------------------------------------------------------ */

function CartLine({line}) {
  const {id, merchandise, attributes, cost, quantity, isOptimistic} = line;
  const product = merchandise?.product;
  const image = merchandise?.image;
  const productPath = product?.handle ? `/products/${product.handle}` : null;

  // Atributos da linha: "Horta: ..." e as trocas ("Troca 1: Rucula -> Agriao").
  // Chaves iniciadas por "_" sao internas e nao aparecem para o cliente.
  const visibleAttributes = (attributes ?? []).filter(
    (attribute) => attribute?.value && !attribute.key.startsWith('_'),
  );

  // Opcoes da variante: "Tamanho: Pequena (P)".
  const options = (merchandise?.selectedOptions ?? []).filter(
    (option) =>
      option.value &&
      option.value !== 'Default Title' &&
      option.name !== 'Title',
  );

  return (
    <li className="ul-cart-line">
      <div className="ul-cart-line-media">
        {image ? (
          <MaybeLink to={productPath}>
            <img
              src={image.url}
              alt={image.altText || product?.title || ''}
              width={image.width ?? 300}
              height={image.height ?? 300}
              loading="lazy"
            />
          </MaybeLink>
        ) : (
          <div className="ul-cart-line-media-empty" aria-hidden="true" />
        )}
      </div>

      <div className="ul-cart-line-info">
        <MaybeLink to={productPath} className="ul-cart-line-title">
          {product?.title}
        </MaybeLink>

        {visibleAttributes.map((attribute) => (
          <p className="ul-cart-line-meta" key={attribute.key}>
            <span className="ul-cart-line-meta-key">{attribute.key}:</span>{' '}
            {attribute.value}
          </p>
        ))}

        {options.map((option) => (
          <p className="ul-cart-line-meta" key={option.name}>
            <span className="ul-cart-line-meta-key">{option.name}:</span>{' '}
            {option.value}
          </p>
        ))}

        <p className="ul-cart-line-unit">{money(merchandise?.price)}</p>
      </div>

      <div className="ul-cart-line-actions">
        <CartLineQuantity
          lineId={id}
          quantity={quantity}
          disabled={!!isOptimistic}
        />
        <CartLineRemove lineId={id} disabled={!!isOptimistic} />
      </div>

      <div className="ul-cart-line-total">
        {moneyWithCode(cost?.totalAmount)}
      </div>
    </li>
  );
}

function MaybeLink({to, className, children}) {
  if (!to) return <span className={className}>{children}</span>;
  return (
    <Link className={className} to={to} prefetch="intent">
      {children}
    </Link>
  );
}

function CartLineQuantity({lineId, quantity, disabled}) {
  const previous = Math.max(1, quantity - 1);
  const next = quantity + 1;

  return (
    <div className="ul-cart-qty">
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesUpdate}
        inputs={{lines: [{id: lineId, quantity: previous}]}}
      >
        <button
          className="ul-cart-qty-btn"
          type="submit"
          aria-label="Diminuir quantidade"
          disabled={disabled || quantity <= 1}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 8h10" />
          </svg>
        </button>
      </CartForm>

      <span className="ul-cart-qty-value" aria-live="polite">
        {quantity}
      </span>

      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesUpdate}
        inputs={{lines: [{id: lineId, quantity: next}]}}
      >
        <button
          className="ul-cart-qty-btn"
          type="submit"
          aria-label="Aumentar quantidade"
          disabled={disabled}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </CartForm>
    </div>
  );
}

function CartLineRemove({lineId, disabled}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds: [lineId]}}
    >
      <button
        className="ul-cart-remove"
        type="submit"
        aria-label="Remover do carrinho"
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 7h16M10 7V5h4v2M6 7l1 12h10l1-12M10 11v5M14 11v5" />
        </svg>
      </button>
    </CartForm>
  );
}

/* ------------------------------------------------------------------ */
/* Resumo                                                              */
/* ------------------------------------------------------------------ */

function CartSummary({cart}) {
  const appliedCodes = (cart?.discountCodes ?? [])
    .filter((discount) => discount.applicable)
    .map((discount) => discount.code);

  return (
    // Nao usar <aside> aqui: o esqueleto estiliza o elemento cru para o
    // drawer lateral (fundo branco, position fixed, 100vh) e a coluna do
    // resumo herda tudo.
    <div
      className="ul-cart-summary"
      role="complementary"
      aria-labelledby="ul-cart-summary-title"
    >
      <h2 className="ul-visually-hidden" id="ul-cart-summary-title">
        Resumo do pedido
      </h2>

      <div className="ul-cart-row">
        <span className="ul-cart-row-label">Subtotal</span>
        <span className="ul-cart-row-value">
          {money(cart?.cost?.subtotalAmount) ?? '—'}
        </span>
      </div>

      <CartDiscount appliedCodes={appliedCodes} />

      {/* Soma so os produtos, de proposito.
          `cost.totalAmount` ja vem com o frete embutido quando o comprador
          tem endereco na sessao — foi assim que o carrinho passou a mostrar
          R$ 10,99 sem explicar de onde vinham os R$ 9,99. Quem calcula e
          mostra o frete e o checkout. */}
      <div className="ul-cart-row ul-cart-row--total">
        <span className="ul-cart-row-label">Total em produtos</span>
        <span className="ul-cart-row-value">
          {moneyWithCode(cart?.cost?.subtotalAmount) ?? '—'}
        </span>
      </div>

      <p className="ul-cart-note">
        Frete e demais valores calculados no checkout.
      </p>

      <a className="ul-cart-checkout" href={cart?.checkoutUrl}>
        Continuar para o checkout
      </a>

      <Link className="ul-cart-continue" to="/pages/produtores">
        Continuar escolhendo cestas
      </Link>
    </div>
  );
}

function CartDiscount({appliedCodes}) {
  const [open, setOpen] = useState(appliedCodes.length > 0);

  return (
    <div className="ul-cart-discount">
      <button
        className="ul-cart-row ul-cart-discount-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="ul-cart-discount-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ul-cart-row-label">Desconto</span>
        <span className="ul-cart-discount-sign" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      <div
        className="ul-cart-discount-panel"
        id="ul-cart-discount-panel"
        hidden={!open}
      >
        {appliedCodes.length > 0 && (
          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.DiscountCodesUpdate}
            inputs={{discountCodes: []}}
          >
            <p className="ul-cart-discount-applied">
              <span>{appliedCodes.join(', ')}</span>
              <button className="ul-cart-discount-remove" type="submit">
                Remover
              </button>
            </p>
          </CartForm>
        )}

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.DiscountCodesUpdate}
          inputs={{discountCodes: appliedCodes}}
        >
          <div className="ul-cart-discount-field">
            <label className="ul-visually-hidden" htmlFor="ul-cart-discount-code">
              Codigo de desconto
            </label>
            <input
              className="ul-cart-discount-input"
              id="ul-cart-discount-code"
              name="discountCode"
              type="text"
              placeholder="Codigo de desconto"
            />
            <button className="ul-cart-discount-apply" type="submit">
              Aplicar
            </button>
          </div>
        </CartForm>
      </div>
    </div>
  );
}
