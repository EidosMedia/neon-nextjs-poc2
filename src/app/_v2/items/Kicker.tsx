export default function Kicker({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="v2-item__kicker" data-type="section">
      {text}
    </span>
  );
}
