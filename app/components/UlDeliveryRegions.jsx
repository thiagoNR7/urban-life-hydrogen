import {UlIcon} from './UlIcon';
import {deliveryRegions} from '~/data/content';

/** Porte de sections/ul-delivery-regions.liquid */
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
            const delay = ((i + 1) % 4) + 1;

            return (
              <div
                key={cluster.zone}
                className={`ul-regions__card ul-reveal ul-reveal-delay-${delay}`}
              >
                <div className="ul-regions__card-head">
                  <div>
                    <p className="ul-regions__card-eyebrow">Cluster regional</p>
                    <h3 className="ul-regions__zone">{cluster.zone}</h3>
                    <p className="ul-regions__horta">{cluster.horta}</p>
                  </div>
                  <div className="ul-regions__day">
                    <UlIcon name="clock" size={12} />
                    <span>{cluster.day}</span>
                  </div>
                </div>

                <div className="ul-regions__neighborhoods">
                  {neighborhoods.map((neighborhood) => (
                    <span className="ul-regions__pill" key={neighborhood}>
                      {neighborhood}
                    </span>
                  ))}
                </div>

                <div className="ul-regions__radius">
                  <UlIcon name="map-pin" size={12} />
                  <span>
                    Raio de entrega: <strong>{cluster.radius}</strong>
                  </span>
                </div>
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
          </a>{' '}
          — estamos expandindo nossa operação em São Paulo.
        </p>
      </div>
    </section>
  );
}
