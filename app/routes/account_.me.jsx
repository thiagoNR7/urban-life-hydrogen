import {UL_CUSTOMER_SUMMARY_QUERY} from '~/graphql/customer-account/UlCustomerSummaryQuery';

/**
 * Rota de recurso: dados mínimos do cliente para o menu do cabeçalho.
 *
 * Existe para o popover não pesar em toda página. Se esses dados fossem no
 * root loader, cada navegação faria uma chamada à Customer Account API —
 * aqui a chamada só acontece quando alguém abre o menu.
 *
 * O underscore em `account_` tira esta rota do layout `account.jsx`, que
 * exige sessão e redireciona para o login. Como aqui a resposta para quem
 * não está logado é um JSON dizendo isso, o redirecionamento atrapalharia.
 */
export async function loader({context}) {
  const {customerAccount, env} = context;

  // URL das páginas de conta hospedadas pela Shopify, o mesmo destino que o
  // site em produção usa. O SHOP_ID vem do Oxygen quando o projeto está
  // vinculado a uma vitrine Hydrogen.
  const accountUrl = env.SHOP_ID
    ? `https://shopify.com/${env.SHOP_ID}/account`
    : '/account';

  const loggedIn = await customerAccount.isLoggedIn();
  if (!loggedIn) {
    return Response.json({loggedIn: false, accountUrl});
  }

  try {
    const {data} = await customerAccount.query(UL_CUSTOMER_SUMMARY_QUERY);
    const customer = data?.customer;

    return Response.json({
      loggedIn: true,
      accountUrl,
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      email: customer?.emailAddress?.emailAddress ?? '',
    });
  } catch {
    // Sessão existe mas a query falhou (token expirado, API fora). Trata como
    // logado sem detalhes, em vez de derrubar o cabeçalho.
    return Response.json({loggedIn: true, accountUrl});
  }
}
