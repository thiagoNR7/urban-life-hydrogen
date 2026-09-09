import {UlIcon} from './UlIcon';
import {howItWorks} from '~/data/content';

/** Porte de sections/ul-how-it-works.liquid */
export function UlHowItWorks() {
  return (
    <section id="como-funciona" className="ul-how">
      <div className="ul-container">
        <h2 className="ul-how__heading ul-reveal">{howItWorks.heading}</h2>
        <p className="ul-how__subheading ul-reveal ul-reveal-delay-1">
          {howItWorks.subheading}
        </p>

        <div className="ul-how__icons">
          {howItWorks.steps.map((step, i) => (
            <span
              key={i}
              className={`ul-how__icon ul-reveal ul-reveal-delay-${i + 1}`}
            >
              <UlIcon name={step.icon} size={40} />
            </span>
          ))}
        </div>

        <div className="ul-how__grid">
          {howItWorks.steps.map((step, i) => (
            <div
              key={i}
              className={`ul-how__card ul-reveal ul-reveal-delay-${i + 1}`}
            >
              <span className="ul-how__step">{i + 1}</span>
              <h3 className="ul-how__card-title">{step.title}</h3>
              <p className="ul-how__card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
