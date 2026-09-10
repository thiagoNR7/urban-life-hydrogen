import {Image} from '@shopify/hydrogen';
import {UlIcon} from './UlIcon';
import {producersUi} from '~/data/producers';

/**
 * Card de produtor.
 *
 * O card inteiro é um <button>: clicar em qualquer parte abre o modal com a
 * história e os cultivos. Por isso o "Ver catálogo" aqui é só um rótulo, não
 * um link — a navegação de verdade é o "Ver Produtos" dentro do modal.
 *
 * Botão e não div com onClick: assim vem de graça o foco por teclado, o
 * acionamento por Enter e Espaço, e o papel correto para leitor de tela.
 *
 * A descrição é truncada por CSS (-webkit-line-clamp), não por JS: cortar
 * string no servidor quebra em palavra errada e não se adapta à largura.
 */
export function UlProducerCard({producer, onOpen}) {
  const {name, horta, neighborhood, badge, description, image} = producer;

  return (
    <button type="button" className="ul-producer-card" onClick={onOpen}>
      <span className="ul-producer-card__media">
        {image ? (
          <Image
            data={image}
            aspectRatio="16/7"
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="ul-producer-card__image"
          />
        ) : (
          <span className="ul-producer-card__image ul-producer-card__image--empty" />
        )}

        {badge && <span className="ul-producer-card__badge">{badge}</span>}
      </span>

      <span className="ul-producer-card__body">
        <span className="ul-producer-card__name">{name}</span>
        {horta && <span className="ul-producer-card__horta">{horta}</span>}

        {neighborhood && (
          <span className="ul-producer-card__location">
            <UlIcon name="map-pin" size={14} />
            <span>{neighborhood}</span>
          </span>
        )}

        {description && (
          <span className="ul-producer-card__description">{description}</span>
        )}

        <span className="ul-producer-card__catalog">
          {producersUi.catalogLabel}
          <UlIcon name="arrow-right" size={16} />
        </span>
      </span>
    </button>
  );
}
