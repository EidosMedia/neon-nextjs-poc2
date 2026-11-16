export default function Byline({ byline, date }: { byline?: string; date?: string }) {
  if (!byline && !date) return null;
  const when = date && !Number.isNaN(Date.parse(date))
    ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : undefined;
  return (
    <p className="v2-item__byline">
      {byline}
      {byline && when ? ' · ' : ''}
      {when}
    </p>
  );
}
