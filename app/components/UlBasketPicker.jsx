import {useState} from 'react';
import {Money, CartForm} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {producerDetailUi, SWAPS_ALLOWED} from '~/data/producers';

/**
 * Seletor de cesta P / M / G.
 *
 * A troca de item é estado local por enquanto: o par escolhido não vai para
 * o carrinho. Para valer no pedido, precisa virar atributo de linha do
 * CartForm (`attributes: [{key: 'Troca', value: '...'}]`), o que faz o par
 * aparecer no pedido do admin e na separação. Ver TODO abaixo.
 */
export function UlBasketPicker({baskets, selected, onSelect}) {
  const [swapOut, setSwapOut] = useState('');
  const [swapIn, setSwapIn] = useState('');

  const items = selected.items ?? [];
  const swapCopy = producerDetailUi.customizeSubtitle.replace(
    '{n}',
    String(SWAPS_ALLOWED),
  );

  return (
    <div className="ul-baskets">
      <h2 className="ul-baskets__title">
        <UlIcon name="leaf" size={18} />
        {producerDetailUi.basketsTitle}
      </h2>
      <p className="ul-baskets__subtitle">{producerDetailUi.basketsSubtitle}</p>

      <div className="ul-baskets__sizes" role="tablist" aria-label="Tamanho da cesta">
        {baskets.map((basket) => (
          <button
            key={basket.id}
            type="button"
            role="tab"
            aria-selected={basket.id === selected.id}
            className={`ul-baskets__size${
              basket.id === selected.id ? ' ul-baskets__size--active' : ''
            }`}
            onClick={() => onSelect(basket.id)}
          >
            <span className="ul-baskets__letter">{basket.letter}</span>
            <span className="ul-baskets__name">{basket.name}</span>
            {basket.itemCount != null && (
              <span className="ul-baskets__count">
                {basket.itemCount} itens
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="ul-baskets__head">
        <h3 className="ul-baskets__selected">Cesta {selected.name}</h3>
        {selected.itemCount != null && (
          <p className="ul-baskets__contains">
            {producerDetailUi.containsPrefix} {selected.itemCount}{' '}
            {producerDetailUi.containsSuffix}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <ul className="ul-baskets__items" role="list">
          {items.map((item) => (
            <li key={item}>
              <UlIcon name="leaf" size={14} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="ul-baskets__customize">
        <h3 className="ul-baskets__customize-title">
          <UlIcon name="swap" size={16} />
          {producerDetailUi.customizeTitle}
        </h3>
        <p className="ul-baskets__customize-copy">{swapCopy}</p>

        <div className="ul-baskets__swap">
          <div className="ul-baskets__field">
            <label htmlFor="ul-swap-out">{producerDetailUi.swapLabel}</label>
            <select
              id="ul-swap-out"
              value={swapOut}
              onChange={(e) => setSwapOut(e.target.value)}
            >
              <option value="">{producerDetailUi.swapPlaceholder}</option>
              {items.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="ul-baskets__field">
            <label htmlFor="ul-swap-in">{producerDetailUi.forLabel}</label>
            <select
              id="ul-swap-in"
              value={swapIn}
              onChange={(e) => setSwapIn(e.target.value)}
              disabled={!swapOut}
            >
              <option value="">{producerDetailUi.forPlaceholder}</option>
              {/* TODO: a lista de substitutos deve vir do que a horta tem
                  disponível na semana, não dos itens da própria cesta. */}
            </select>
          </div>
        </div>
      </div>

      <div className="ul-baskets__footer">
        <div className="ul-baskets__price-block">
          {selected.price ? (
            <p className="ul-baskets__price">
              <Money data={selected.price} />
            </p>
          ) : (
            <p className="ul-baskets__price ul-baskets__price--missing">—</p>
          )}
          <p
            className={`ul-baskets__stock${
              selected.available ? '' : ' ul-baskets__stock--out'
            }`}
          >
            {selected.available
              ? producerDetailUi.available
              : producerDetailUi.unavailable}
          </p>
        </div>

        {selected.variantId ? (
          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesAdd}
            inputs={{
              lines: [
                {
                  merchandiseId: selected.variantId,
                  quantity: 1,
                  // O par de troca vira atributo da linha, então aparece no
                  // pedido do admin e na hora de separar a cesta.
                  attributes:
                    swapOut && swapIn
                      ? [{key: 'Troca', value: `${swapOut} → ${swapIn}`}]
                      : [],
                },
              ],
            }}
          >
            <button
              type="submit"
              className="ul-btn ul-btn--solid ul-btn--lg ul-baskets__cta"
              disabled={!selected.available}
            >
              {producerDetailUi.chooseprefix} {selected.name}
            </button>
          </CartForm>
        ) : (
          <button
            type="button"
            className="ul-btn ul-btn--solid ul-btn--lg ul-baskets__cta"
            disabled
          >
            {producerDetailUi.chooseprefix} {selected.name}
          </button>
        )}
      </div>
    </div>
  );
}
