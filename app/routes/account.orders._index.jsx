import {Link, useLoaderData} from 'react-router';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {UlIcon} from '~/components/UlIcon';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pedidos | Urban Life'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  if (!orders?.nodes.length) {
    return <EmptyOrders hasFilters={hasFilters} />;
  }

  return (
    <PaginatedResourceSection
      connection={orders}
      resourcesClassName="ul-conta__orders"
      ariaLabel="Seus pedidos"
    >
      {({node: order}) => <OrderItem key={order.id} order={order} />}
    </PaginatedResourceSection>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  return (
    <div className="ul-conta__empty">
      {hasFilters ? (
        <>
          <h2 className="ul-conta__empty-title">
            Nenhum pedido encontrado
          </h2>
          <p className="ul-conta__empty-copy">
            Não achamos pedidos com esse filtro.
          </p>
          <Link to="/account/orders" className="ul-btn ul-btn--solid ul-btn--lg">
            Limpar filtro
          </Link>
        </>
      ) : (
        <>
          <h2 className="ul-conta__empty-title">
            Você ainda não fez nenhum pedido
          </h2>
          <p className="ul-conta__empty-copy">
            Escolha uma cesta da seleção da semana e acompanhe seu pedido por
            aqui.
          </p>
          <Link to="/collections/all" className="ul-btn ul-btn--solid ul-btn--lg">
            Ver seleção da semana
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * Resume o status financeiro e de entrega do pedido numa palavra só, no
 * vocabulário da tela ("Pago", "Preparando", "A caminho", "Entregue") — o
 * pedido tem os dois campos, mas o cartão mostra um selo só.
 * @param {{financialStatus: string | null; fulfillmentStatus: string | null | undefined}}
 */
function getOrderStatus({financialStatus, fulfillmentStatus}) {
  if (fulfillmentStatus === 'FULFILLED' || fulfillmentStatus === 'SUCCESS') {
    return {label: 'Entregue', modifier: 'fulfilled'};
  }

  if (
    fulfillmentStatus === 'IN_PROGRESS' ||
    fulfillmentStatus === 'OPEN' ||
    fulfillmentStatus === 'PARTIALLY_FULFILLED'
  ) {
    return {label: 'A caminho', modifier: null};
  }

  if (financialStatus === 'PAID') {
    return {label: 'Pago', modifier: 'paid'};
  }

  return {label: 'Preparando', modifier: null};
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const status = getOrderStatus({
    financialStatus: order.financialStatus,
    fulfillmentStatus,
  });
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  // O fragmento de pedido ainda não traz itens/imagens (ORDER_ITEM_FRAGMENT
  // em CustomerOrdersQuery.js) — as miniaturas aparecem assim que isso for
  // adicionado lá, sem precisar mexer aqui.
  const thumbs = order.lineItems?.nodes ?? [];

  return (
    <article className="ul-order">
      {thumbs.length > 0 && (
        <div className="ul-order__thumbs">
          {thumbs.slice(0, 3).map((item, index) => (
            <img
              key={item.id ?? index}
              className="ul-order__thumb"
              src={item.image?.url}
              alt=""
            />
          ))}
        </div>
      )}

      <div className="ul-order__body">
        <div className="ul-order__top">
          <span className="ul-order__number">Pedido #{order.number}</span>
          <span
            className={`ul-order__status${
              status.modifier ? ` ul-order__status--${status.modifier}` : ''
            }`}
          >
            {status.label}
          </span>
        </div>

        <p className="ul-order__meta">
          {new Date(order.processedAt).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {order.confirmationNumber && ` · Confirmação ${order.confirmationNumber}`}
        </p>
      </div>

      <div className="ul-order__actions">
        <span className="ul-order__total">
          <Money data={order.totalPrice} />
        </span>
        <Link to={orderUrl} className="ul-order__link">
          Ver pedido
          <UlIcon name="arrow-right" size={16} />
        </Link>
      </div>
    </article>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
