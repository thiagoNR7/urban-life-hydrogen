import {Link} from 'react-router';

/**
 * Aviso de dia de entrega, para ficar junto do preco na pagina do produtor.
 *
 * A zona e do CLIENTE, nao da horta: quem mora na Leste recebe quinta mesmo
 * comprando de uma horta da Norte. Por isso aqui nao da para mostrar data —
 * so no checkout, depois do CEP.
 *
 * O dia exato por CEP quem resolve e o Shopify: criar uma tarifa de frete
 * por zona no admin, com o dia no nome ("Zona Norte — terça-feira"), e o
 * cliente ve a dele na hora de escolher o frete. Sem codigo.
 *
 * As zonas vem de `deliveryRegions.clusters` em `app/data/content.js` — a
 * mesma lista do rodape e da home. Nao duplicar aqui: dia de entrega em dois
 * lugares vira dia de entrega divergente.
 *
 * `verZonasHref` e opcional; sem ele o rodape nao aparece.
 */
export function UlDeliveryNote({clusters = [], verZonasHref, className}) {
  const ativas = clusters.filter((zona) => zona.active);

  if (ativas.length === 0) return null;

  return (
    <div className={className ?? 'ul-delivery-note'}>
      <p className="ul-delivery-note-titulo">Entrega programada por região</p>

      <ul className="ul-delivery-note-lista">
        {ativas.map((zona) => (
          <li className="ul-delivery-note-item" key={zona.zone}>
            <span className="ul-delivery-note-zona">{zona.zone}</span>
            <span className="ul-delivery-note-dia">{zona.day}</span>
          </li>
        ))}
      </ul>

      {verZonasHref ? (
        <p className="ul-delivery-note-rodape">
          <Link to={verZonasHref}>Ver zonas atendidas</Link>
        </p>
      ) : null}
    </div>
  );
}

export default UlDeliveryNote;
