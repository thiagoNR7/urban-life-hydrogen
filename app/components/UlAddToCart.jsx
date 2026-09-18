import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';

/**
 * Botao de adicionar ao carrinho com confirmacao.
 *
 * Substitui a gaveta lateral do esqueleto, que estava em ingles ("Quantity",
 * "Remove", "Continue to Checkout", "Title: Default Title") porque aqueles
 * textos vivem no codigo do template, nao no Shopify — mudar o idioma da loja
 * nao os alcanca.
 *
 * Comportamento: adiciona e avisa num cartao no canto, sem escurecer a
 * pagina nem bloquear a navegacao. Quem quer fechar a compra clica em "Ver
 * carrinho"; quem esta montando o pedido so continua — nao precisa nem
 * dispensar o aviso.
 *
 * NAO usar isto na cesta da pagina do produtor: la a escolha ja esta completa
 * (tamanho, troca, horta) e o botao vai direto para /cart via `redirectTo`.
 * Aqui e o contrario — pesto e afins sao complemento, e mandar para o
 * carrinho a cada item obriga a voltar toda vez.
 *
 * Uso:
 *   <UlAddToCart
 *     lines={[{merchandiseId: variante.id, quantity: 1}]}
 *     disponivel={variante.availableForSale}
 *     nome={product.title}
 *   >
 *     Adicionar à cesta
 *   </UlAddToCart>
 */
export function UlAddToCart({
  lines,
  disponivel = true,
  nome,
  className,
  children,
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesAdd}
        inputs={{lines}}
      >
        {(fetcher) => (
          <AddButton
            fetcher={fetcher}
            disponivel={disponivel}
            className={className}
            onAdicionado={() => setAberto(true)}
          >
            {children}
          </AddButton>
        )}
      </CartForm>

      <UlAddedDialog
        aberto={aberto}
        nome={nome}
        onFechar={() => setAberto(false)}
      />
    </>
  );
}

function AddButton({fetcher, disponivel, className, onAdicionado, children}) {
  const enviando = fetcher.state !== 'idle';

  // Abre a confirmacao quando a resposta do LinesAdd chega. O ref evita
  // reabrir a cada re-render depois que o fetcher volta para idle.
  const jaAvisado = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && !jaAvisado.current) {
      jaAvisado.current = true;
      onAdicionado();
    }
    if (fetcher.state === 'submitting') {
      jaAvisado.current = false;
    }
  }, [fetcher.state, fetcher.data, onAdicionado]);

  return (
    <button
      className={className ?? 'ul-btn ul-btn--solid ul-btn--lg'}
      type="submit"
      disabled={!disponivel || enviando}
    >
      {enviando ? 'Adicionando…' : children}
    </button>
  );
}

function UlAddedDialog({aberto, nome, onFechar}) {
  const fecharRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar();
    };

    document.addEventListener('keydown', aoTeclar);
    fecharRef.current?.focus();

    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    // <div>, nao <aside> nem <dialog>: o esqueleto estiliza esses elementos
    // crus em app.css e o cartao herdaria fundo branco, position fixed e
    // 100vh. Mesmo motivo do resumo do carrinho.
    //
    // `role="status"` e nao `dialog`: isto avisa, nao interrompe. Leitor de
    // tela anuncia sem roubar o foco de quem esta navegando.
    <div className="ul-added" role="status" aria-live="polite">
      <div className="ul-added-topo">
        <div>
          <p className="ul-added-titulo">Adicionado à cesta</p>
          {nome ? <p className="ul-added-item">{nome}</p> : null}
        </div>

        <button
          className="ul-added-fechar"
          type="button"
          onClick={onFechar}
          aria-label="Fechar aviso"
          ref={fecharRef}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="ul-added-acoes">
        <Link className="ul-added-primario" to="/cart" prefetch="intent">
          Ver carrinho
        </Link>

        <button
          className="ul-added-secundario"
          type="button"
          onClick={onFechar}
        >
          Continuar comprando
        </button>
      </div>
    </div>
  );
}

export default UlAddToCart;
