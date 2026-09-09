import {Link} from 'react-router';
import {footer} from '~/data/content';

/** Porte de sections/ul-footer.liquid */
export function UlFooter() {
  const logoWidth = Math.round((footer.logoHeight * 1914) / 2406);

  return (
    <footer className="ul-footer">
      <div className="ul-container ul-footer__inner">
        <div className="ul-footer__grid">
          <div className="ul-footer__brand">
            <div className="ul-footer__logo-row">
              <img
                src="/images/ul-logo.png"
                alt="Urban Life"
                className="ul-footer__logo"
                height={footer.logoHeight}
                width={logoWidth}
                style={{height: `${footer.logoHeight}px`, width: `${logoWidth}px`}}
                loading="lazy"
              />
              <span className="ul-footer__wordmark">Urban Life</span>
            </div>
            <p className="ul-footer__brand-copy">{footer.brandCopy}</p>
          </div>

          <div className="ul-footer__col">
            <h4 className="ul-footer__col-heading">Navegação</h4>
            <nav className="ul-footer__nav">
              {footer.nav.map((item) => (
                <Link key={item.href} to={item.href} className="ul-footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="ul-footer__col">
            <h4 className="ul-footer__col-heading">Entrega programada</h4>
            <div className="ul-footer__delivery">
              {footer.deliveryZones.map((zone) => (
                <p key={zone.zone}>
                  <span aria-hidden="true">📍</span> {zone.zone}{' '}
                  <span className="ul-footer__delivery-day">→ {zone.day}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="ul-footer__col">
            <h4 className="ul-footer__col-heading">Nossa missão</h4>
            <p className="ul-footer__mission-copy">{footer.missionCopy}</p>
            <div className="ul-footer__mission-tags">
              {footer.missionTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="ul-footer__bottom">
          <p className="ul-footer__copyright">{footer.copyright}</p>
          <p className="ul-footer__tagline">{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
