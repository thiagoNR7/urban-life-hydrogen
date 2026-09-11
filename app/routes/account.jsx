import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();
  const email = customer.emailAddress?.emailAddress;

  return (
    <section className="ul-conta">
      <div className="ul-container">
        <div className="ul-conta__header">
          <span className="ul-eyebrow">Minha conta</span>
          <h1 className="ul-conta__greeting">
            {customer.firstName ? `Olá, ${customer.firstName}` : 'Olá'}
          </h1>
          {email && <p className="ul-conta__email">{email}</p>}
        </div>

        <AccountNav />

        <Outlet context={{customer}} />
      </div>
    </section>
  );
}

function AccountNav() {
  return (
    <nav className="ul-conta__nav" aria-label="Navegação da conta">
      <NavLink to="/account/orders" className="ul-conta__tab">
        Pedidos
      </NavLink>
      <NavLink to="/account/profile" className="ul-conta__tab">
        Perfil
      </NavLink>
      <NavLink to="/account/addresses" className="ul-conta__tab">
        Endereços
      </NavLink>

      <Form
        className="ul-conta__signout"
        method="POST"
        action="/account/logout"
      >
        <button type="submit">Sair</button>
      </Form>
    </nav>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
