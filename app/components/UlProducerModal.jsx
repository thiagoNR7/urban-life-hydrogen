import {useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {producersUi} from '~/data/producers';

/**
 * Detalhe do produtor.
 *
 * Usa <dialog> nativo em vez de uma div com role="dialog". O navegador então
 * entrega de graça três coisas que dariam trabalho à mão: foco preso dentro
 * do modal, Escape fechando, e o resto da página marcado como inerte para
 * leitores de tela.
 */
export function UlProducerModal({producer, onClose}) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (producer && !dialog.open) {
      dialog.showModal();
      // showModal() move o foco para o primeiro elemento focável e o navegador
      // rola para trazê-lo à vista, o que abria o modal já deslocado. Zerar
      // agora e de novo no próximo quadro cobre também o reflow que acontece
      // quando a foto termina de carregar.
      const resetScroll = () => {
        if (innerRef.current) innerRef.current.scrollTop = 0;
      };
      resetScroll();
      requestAnimationFrame(resetScroll);
    }
    if (!producer && dialog.open) dialog.close();
  }, [producer]);

  // Trava a rolagem do fundo enquanto o modal está aberto, senão a página
  // atrás rola junto com a roda do mouse.
  useEffect(() => {
    if (!producer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [producer]);

  /**
   * O clique no backdrop chega como clique no próprio <dialog>, já que o
   * conteúdo fica num filho. Comparar o target com o dialog distingue os dois.
   */
  function handleClick(event) {
    if (event.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      className="ul-producer-modal"
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby="ul-producer-modal-title"
    >
      {producer && (
        <div className="ul-producer-modal__inner" ref={innerRef}>
          <div className="ul-producer-modal__media">
            {producer.coverImage || producer.image ? (
              <Image
                data={producer.coverImage ?? producer.image}
                aspectRatio="16/10"
                sizes="(min-width: 640px) 520px, 100vw"
                className="ul-producer-modal__image"
              />
            ) : (
              <div className="ul-producer-modal__image ul-producer-modal__image--empty" />
            )}

            <div className="ul-producer-modal__scrim" aria-hidden="true" />

            <button
              type="button"
              className="ul-producer-modal__close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <UlIcon name="close" size={20} />
            </button>

            <div className="ul-producer-modal__headline">
              <h2
                id="ul-producer-modal-title"
                className="ul-producer-modal__title"
              >
                {producer.name}
              </h2>
              <p className="ul-producer-modal__location">
                <UlIcon name="map-pin" size={14} />
                <span>
                  {[producer.neighborhood, producer.region]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </p>
            </div>
          </div>

          <div className="ul-producer-modal__body">
            {producer.practices.length > 0 && (
              <ul className="ul-producer-modal__practices" role="list">
                {producer.practices.map((practice) => (
                  <li key={practice}>{practice}</li>
                ))}
              </ul>
            )}

            {producer.story && (
              <div className="ul-producer-modal__section">
                <h3 className="ul-producer-modal__section-title">História</h3>
                <p className="ul-producer-modal__story">{producer.story}</p>
              </div>
            )}

            {producer.crops.length > 0 && (
              <div className="ul-producer-modal__section">
                <h3 className="ul-producer-modal__section-title">
                  O que cultiva
                </h3>
                <ul className="ul-producer-modal__crops" role="list">
                  {producer.crops.map((crop) => (
                    <li key={crop}>{crop}</li>
                  ))}
                </ul>
              </div>
            )}

            <a
              href={producer.catalogUrl}
              className="ul-btn ul-btn--solid ul-btn--lg ul-producer-modal__cta"
            >
              {producersUi.productsLabel}
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
