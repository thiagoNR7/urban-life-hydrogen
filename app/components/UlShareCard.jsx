import {useState} from 'react';
import {UlIcon} from './UlIcon';
import {producerDetailUi} from '~/data/producers';

/**
 * Cartão de divulgação.
 *
 * O botão principal usa a Web Share API quando existe (celular abre a folha
 * nativa de compartilhamento) e cai para copiar o link quando não existe,
 * que é o caso da maioria dos navegadores em desktop.
 */
export function UlShareCard({url, producerName}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bloqueado (contexto não seguro, permissão negada). Silencia:
      // o link está visível no input e pode ser copiado à mão.
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producerName,
          text: `Conheça a horta ${producerName} na Urban Life`,
          url,
        });
        return;
      } catch {
        // Usuário cancelou a folha de compartilhamento. Nada a fazer.
        return;
      }
    }
    copy();
  }

  return (
    <div className="ul-share">
      <h2 className="ul-share__title">
        <UlIcon name="link" size={18} />
        {producerDetailUi.shareTitle}
      </h2>
      <p className="ul-share__subtitle">{producerDetailUi.shareSubtitle}</p>

      <div className="ul-share__row">
        <input
          className="ul-share__input"
          type="text"
          value={url}
          readOnly
          onFocus={(e) => e.target.select()}
          aria-label="Link desta horta"
        />
        <button type="button" className="ul-share__copy" onClick={copy}>
          {copied ? producerDetailUi.copied : producerDetailUi.copy}
        </button>
      </div>

      <button
        type="button"
        className="ul-btn ul-btn--solid ul-btn--lg ul-share__cta"
        onClick={share}
      >
        <UlIcon name="link" size={16} />
        {producerDetailUi.share}
      </button>
    </div>
  );
}
