import {UlIcon} from './UlIcon';
import {statsBar} from '~/data/content';

/** Porte de sections/ul-stats-bar.liquid */
export function UlStatsBar() {
  return (
    <div className="ul-stats-bar">
      <div className="ul-container">
        <div className="ul-stats-bar__grid">
          {statsBar.metrics.map((metric, i) => (
            <div className="ul-stats-bar__item" key={i}>
              <span className="ul-icon-badge">
                <UlIcon name={metric.icon} />
              </span>
              <div>
                <p className="ul-stats-bar__number">{metric.number}</p>
                <p className="ul-stats-bar__label">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
