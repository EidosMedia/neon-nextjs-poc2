/** Visual only: fade over the truncated body, then a premium card. No access control. */
export default function Paywall({ marker = false }: { marker?: boolean }) {
  return (
    <div className={`v2-paywall${marker ? ' v2-paywall--marker' : ''}`}>
      {marker ? (
        <p className="v2-paywall__marker">Paywall starts here (preview)</p>
      ) : (
        <div className="v2-paywall__fade" aria-hidden="true" />
      )}
      <div className="v2-paywall__card">
        <h2 className="v2-paywall__title">Read without limits</h2>
        <button type="button" className="v2-paywall__button">Subscribe now</button>
      </div>
    </div>
  );
}
