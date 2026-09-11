import {useMemo, useState} from 'react';
import {Money, CartForm} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {canSubstitute, producerDetailUi} from '~/data/producers';

/**
 * Seletor de cesta P / M / G, com troca de itens.
 *
 * Regra da troca, definida em canSubstitute(): sai um, entra um, do mesmo
 * grupo, com preço igual ou menor, disponível na semana e ainda fora da
 * cesta. A quantidade final de itens nunca muda.
 *
 * O número de trocas permitidas vem do tamanho: 1 na P, 2 na M, 3 na G.
 *
 * Cada troca vira um atributo da linha do carrinho, então chega ao pedido
 * do admin e à separação em vez de morrer no front.
 */
export function UlBasketPicker({baskets, selected, catalog = [], onSelect}) {
  // Uma troca é {out, in}. A lista começa com uma em branco.
  const [swaps, setSwaps] = useState([{out: '', in: ''}]);

  const items = selected.items ?? [];
  const maxSwaps = selected.maxSwaps ?? 1;

  // Itens já escolhidos para sair, para não oferecer o mesmo duas vezes.
  const takenOut = swaps.map((swap) => swap.out).filter(Boolean);

  // Composição final: o que entrou substitui o que saiu, na mesma posição.
  /**
   * Composição final.
   *
   * Substitui apenas a PRIMEIRA ocorrência de cada item trocado. Com
   * duplicata permitida, a cesta pode ter dois itens de mesmo nome — se
   * trocasse por nome sem consumir a ocorrência, os dois sumiriam de uma vez
   * e a cesta perderia um item.
   */
  const finalItems = useMemo(() => {
    const pending = swaps
      .filter((swap) => swap.out && swap.in)
      .map((swap) => ({...swap, used: false}));

    return items.map((item) => {
      const match = pending.find(
        (swap) => !swap.used && swap.out === item.name,
      );
      if (!match) return item;
      match.used = true;
      return catalog.find((c) => c.name === match.in) ?? item;
    });
  }, [items, swaps, catalog]);

  function updateSwap(index, patch) {
    setSwaps((current) =>
      current.map((swap, i) => (i === index ? {...swap, ...patch} : swap)),
    );
  }

  function addSwap() {
    setSwaps((current) => [...current, {out: '', in: ''}]);
  }

  function removeSwap(index) {
    setSwaps((current) =>
      current.length === 1
        ? [{out: '', in: ''}]
        : current.filter((_, i) => i !== index),
    );
  }

  const activeSwaps = swaps.filter((swap) => swap.out && swap.in);
  const canAddMore = swaps.length < maxSwaps;

  const swapCopy =
    maxSwaps === 1
      ? 'Não gosta de algum item? Você pode trocar 1 item da cesta.'
      : `Não gosta de algum item? Você pode fazer até ${maxSwaps} trocas.`;

  return (
    <div className="ul-baskets">
      <h2 className="ul-baskets__title">
        <UlIcon name="leaf" size={18} />
        {producerDetailUi.basketsTitle}
      </h2>
      <p className="ul-baskets__subtitle">{producerDetailUi.basketsSubtitle}</p>

      <div
        className="ul-baskets__sizes"
        role="tablist"
        aria-label="Tamanho da cesta"
      >
        {baskets.map((basket) => (
          <button
            key={basket.id}
            type="button"
            role="tab"
            aria-selected={basket.id === selected.id}
            className={`ul-baskets__size${
              basket.id === selected.id ? ' ul-baskets__size--active' : ''
            }`}
            onClick={() => {
              onSelect(basket.id);
              // Trocas pertencem ao tamanho: mudar de cesta zera a escolha,
              // senão sobraria uma troca apontando para item que saiu.
              setSwaps([{out: '', in: ''}]);
            }}
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

      {finalItems.length > 0 && (
        <ul className="ul-baskets__items" role="list">
          {finalItems.map((item, i) => {
            const swapped = item.name !== items[i]?.name;

            return (
              <li
                key={`${item.name}-${i}`}
                className={swapped ? 'ul-baskets__item--swapped' : undefined}
              >
                <UlIcon name="leaf" size={14} />
                <span>
                  {item.name}
                  {item.unit ? ` - ${item.unit}` : ''}
                </span>
                {swapped && (
                  <span className="ul-baskets__swapped-tag">trocado</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="ul-baskets__customize">
        <h3 className="ul-baskets__customize-title">
          <UlIcon name="swap" size={16} />
          {producerDetailUi.customizeTitle}
        </h3>
        <p className="ul-baskets__customize-copy">{swapCopy}</p>

        {swaps.map((swap, index) => {
          const outgoing = items.find((item) => item.name === swap.out);

          // Opções calculadas na hora: dependem do item que sai.
          const options = outgoing
            ? catalog.filter((candidate) => canSubstitute(candidate, outgoing))
            : [];

          return (
            <div className="ul-baskets__swap" key={index}>
              <div className="ul-baskets__field">
                <label htmlFor={`ul-swap-out-${index}`}>
                  {producerDetailUi.swapLabel}
                </label>
                <select
                  id={`ul-swap-out-${index}`}
                  value={swap.out}
                  onChange={(e) =>
                    updateSwap(index, {out: e.target.value, in: ''})
                  }
                >
                  <option value="">{producerDetailUi.swapPlaceholder}</option>
                  {items
                    .filter(
                      (item) =>
                        item.name === swap.out || !takenOut.includes(item.name),
                    )
                    .map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                        {item.unit ? ` - ${item.unit}` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="ul-baskets__field">
                <label htmlFor={`ul-swap-in-${index}`}>
                  {producerDetailUi.forLabel}
                </label>
                <select
                  id={`ul-swap-in-${index}`}
                  value={swap.in}
                  onChange={(e) => updateSwap(index, {in: e.target.value})}
                  disabled={!swap.out || options.length === 0}
                >
                  <option value="">
                    {producerDetailUi.forPlaceholder}
                  </option>
                  {options.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                      {option.unit ? ` - ${option.unit}` : ''}
                    </option>
                  ))}
                </select>

                {swap.out && options.length === 0 && (
                  <p className="ul-baskets__no-options">
                    Sem substituto disponível para este item esta semana.
                  </p>
                )}
              </div>

              {swaps.length > 1 && (
                <button
                  type="button"
                  className="ul-baskets__remove-swap"
                  onClick={() => removeSwap(index)}
                >
                  Remover troca
                </button>
              )}
            </div>
          );
        })}

        {canAddMore && (
          <button
            type="button"
            className="ul-baskets__add-swap"
            onClick={addSwap}
          >
            <UlIcon name="swap" size={14} />
            Adicionar outra troca
          </button>
        )}
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
                  // Uma linha por troca, numerada — é o formato que a
                  // separação e o WhatsApp precisam ler.
                  attributes: activeSwaps.map((swap, i) => ({
                    key: `Troca ${i + 1}`,
                    value: `${swap.out} → ${swap.in}`,
                  })),
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
