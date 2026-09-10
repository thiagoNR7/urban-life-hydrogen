import {UlIcon} from './UlIcon';
import {deliveryRegions} from '~/data/content';

/**
 * Zonas de entrega.
 *
 * Atualizado para o site atual: cada cluster tem um campo `active`.
 *
 *   ativa    → chip verde com o dia da semana + linha de raio de entrega
 *   inativa  → chip cinza "Em breve" com cadeado + nota de atendimento futuro,
 *              sem raio (não faz sentido prometer distância onde não se entrega)
 *
 * O card inteiro fica esmaecido quando inativo, via .ul-regions__card--soon.
 */
export function UlDeliveryRegions() {
  return (
    <section id="produtores" className="ul-regions">
      <div className="ul-container">
        <div className="ul-regions__intro ul-reveal">
          <span className="ul-eyebrow ul-regions__eyebrow">
            {deliveryRegions.eyebrow}
          </span>
          <h2 className="ul-regions__heading">{deliveryRegions.heading}</h2>
          <p className="ul-regions__subheading">{deliveryRegions.subheading}</p>
        </div>

        <div className="ul-regions__grid">
          {deliveryRegions.clusters.map((cluster, i) => {
            const neighborhoods = cluster.neighborhoods
              .split(',')
              .map((n) => n.trim())
              .filter(Boolean);
            const delay = (i % 4) + 1;
            const isActive = cluster.active !== false;

            return (
              <div
                key={cluster.zone}
                className={[
                  'ul-regions__card',
                  'ul-reveal',
                  `ul-reveal-delay-${delay}`,
                  isActive ? '' : 'ul-regions__card--soon',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="ul-regions__card-head">
                  <div>
                    <p className="ul-regions__card-eyebrow">Cluster regional</p>
                    <h3 className="ul-regions__zone">{cluster.zone}</h3>
                    <p className="ul-regions__horta">{cluster.horta}</p>
                  </div>

                  {isActive ? (
                    <div className="ul-regions__day">
                      <UlIcon name="clock" size={12} />
                      <span>{cluster.day}</span>
                    </div>
                  ) : (
                    <div className="ul-regions__day ul-regions__day--soon">
                      <UlIcon name="lock" size={12} />
                      <span>{deliveryRegions.soonLabel}</span>
                    </div>
                  )}
                </div>

                <div className="ul-regions__neighborhoods">
                  {neighborhoods.map((neighborhood) => (
                    <span className="ul-regions__pill" key={neighborhood}>
                      {neighborhood}
                    </span>
                  ))}
                </div>

                {isActive ? (
                  <div className="ul-regions__radius">
                    <UlIcon name="map-pin" size={12} />
                    <span>
                      Raio de entrega: <strong>{cluster.radius}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="ul-regions__radius ul-regions__radius--soon">
                    <UlIcon name="lock" size={12} />
                    <span>{deliveryRegions.soonNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="ul-regions__footer-note">
          Sua região não está listada?{' '}
          <a
            href={deliveryRegions.contactLink}
            className="ul-regions__contact-link"
          >
            Entre em contato
          </a>
          : estamos expandindo nossa operação em São Paulo.
        </p>
      </div>
    </section>
  );
}
