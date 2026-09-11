/**
 * Resumo do cliente para o menu do cabeçalho.
 *
 * Este arquivo precisa morar em `app/graphql/customer-account/` — não é
 * organização, é requisito. O `.graphqlrc.js` do projeto aponta duas
 * schemas diferentes: a Storefront API para o resto do app e a Customer
 * Account API para os arquivos desta pasta.
 *
 * Com a query escrita direto na rota, o codegen a validava contra a
 * Storefront API e acusava erro — lá o campo é `email` e a query exige
 * `customerAccessToken`. Aqui, `emailAddress { emailAddress }` está certo.
 */
export const UL_CUSTOMER_SUMMARY_QUERY = `#graphql
  query UlCustomerSummary {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;
