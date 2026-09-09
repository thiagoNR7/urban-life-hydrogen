import {useLoaderData, Link} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {UlIcon} from '~/components/UlIcon';

/**
 * Carrinho.
 *
 * O `action` é o que recebe todos os CartForm do site — o botão "Adicionar
 * à cesta" da página de produto posta aqui. É por isso que o CartForm de lá
 * tem route="/cart".
 *
 * O botão de finalizar é um link para `cart.checkoutUrl`. Aquilo leva para o
 * checkout do Shopify, com o Pix, cartão e boleto que já estão configurados
 * na sua loja. Nenhuma linha de código de pagamento é escrita aqui.
 */

export async function action({request, context}) {
  const {cart} = context;
  const formData = await request.formData();
  const {action: cartAction, inputs} = CartForm.getFormInput(formData);

  if (!cartAction) throw new Error('Ação de carrinho não informada');

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
    default:
      throw new Error(`Ação não suportada: ${cartAction}`);
  }

  // Repassa o cookie do carrinho, senão o carrinho se perde entre requisições.
  return Response.json(result, {headers: cart.setCartId(result.cart.id)});
}

export async function loader({context}) {
  return {cart: await context.cart.get()};
}

export const meta = () => [{title: 'Sua cesta | Urban Life'}];

export default function Cart() {
  const {cart} = useLoaderData();
  const lines = cart?.lines?.nodes ?? [];

  if (lines.length === 0) {
    return (
      <section className="ul-cart">
        <div className="ul-container ul-cart__empty">
          <h1 className="ul-cart__heading">Sua cesta está vazia</h1>
          <p className="ul-cart__empty-copy">
            Escolha uma cesta da seleção desta semana e a gente agenda a entrega
            na sua região.
          </p>
          <Link to="/collections/all" className="ul-btn ul-btn--solid ul-btn--lg">
            Ver seleção da semana
            <UlIcon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="ul-cart">
      <div className="ul-container ul-cart__grid">
        <div className="ul-cart__lines">
          <h1 className="ul-cart__heading">Sua cesta</h1>

          {lines.map((line) => (
            <div className="ul-cart__line" key={line.id}>
              {line.merchandise.image && (
                <Image
                  data={line.merchandise.image}
                  aspectRatio="1/1"
                  width={96}
                  height={96}
                  sizes="96px"
                  className="ul-cart__line-image"
                />
              )}

              <div className="ul-cart__line-body">
                <Link
                  to={`/products/${line.merchandise.product.handle}`}
                  className="ul-cart__line-title"
                >
                  {line.merchandise.product.title}
                </Link>
                {line.merchandise.title !== 'Default Title' && (
                  <p className="ul-cart__line-variant">
                    {line.merchandise.title}
                  </p>
                )}
                <p className="ul-cart__line-price">
                  <Money data={line.cost.totalAmount} />
                </p>

                <div className="ul-cart__line-actions">
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesUpdate}
                    inputs={{
                      lines: [{id: line.id, quantity: line.quantity - 1}],
                    }}
                  >
                    <button
                      type="submit"
                      className="ul-cart__qty-btn"
                      aria-label="Diminuir quantidade"
                      disabled={line.quantity <= 1}
                    >
                      −
                    </button>
                  </CartForm>

                  <span className="ul-cart__qty">{line.quantity}</span>

                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesUpdate}
                    inputs={{
                      lines: [{id: line.id, quantity: line.quantity + 1}],
                    }}
                  >
                    <button
                      type="submit"
                      className="ul-cart__qty-btn"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </CartForm>

                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesRemove}
                    inputs={{lineIds: [line.id]}}
                  >
                    <button type="submit" className="ul-cart__remove">
                      Remover
                    </button>
                  </CartForm>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="ul-cart__summary ul-card">
          <h2 className="ul-cart__summary-heading">Resumo</h2>

          <div className="ul-cart__summary-row">
            <span>Subtotal</span>
            <strong>
              <Money data={cart.cost.subtotalAmount} />
            </strong>
          </div>

          <p className="ul-cart__summary-note">
            O frete e a data de entrega são calculados no checkout, de acordo
            com a sua região.
          </p>

          <a
            href={cart.checkoutUrl}
            className="ul-btn ul-btn--solid ul-btn--lg ul-cart__checkout"
          >
            Finalizar pedido
            <UlIcon name="arrow-right" size={16} />
          </a>

          <p className="ul-cart__summary-secure">
            Pagamento processado pelo Shopify — Pix, cartão ou boleto.
          </p>
        </aside>
      </div>
    </section>
  );
}
