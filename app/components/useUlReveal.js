import {useEffect} from 'react';

/**
 * Porte de assets/ul-reveal.js.
 *
 * No tema era um script solto que rodava um querySelectorAll no load.
 * Aqui é um hook: roda depois da hidratação e re-observa quando a rota muda,
 * que é o bug clássico de portar scroll-reveal para SPA — sem isso, navegar
 * de /produtos para / deixa as seções invisíveis para sempre.
 *
 * Mesmo threshold (0.15) e mesma classe (.ul-in-view) do original.
 */
export function useUlReveal(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll('.ul-reveal:not(.ul-in-view)');
    if (!elements.length) return;

    // Respeita prefers-reduced-motion: mostra tudo sem animar.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('ul-in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ul-in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      {threshold: 0.15},
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
