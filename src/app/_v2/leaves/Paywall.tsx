/** Visual only: fade over the truncated body, then a premium card. No access control. */
export default function Paywall() {
  return (
    <div className="v2-paywall">
      <div className="v2-paywall__fade" aria-hidden="true" />
      <div className="v2-paywall__card">
        <h2 className="v2-paywall__title">Read without limits</h2>
        <button type="button" className="v2-paywall__button">Subscribe now</button>
      </div>
    </div>
  );
}
