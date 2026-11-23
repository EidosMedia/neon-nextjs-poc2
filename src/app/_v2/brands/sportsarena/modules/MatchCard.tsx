import type { MatchData } from '../../moduleData';

export default function MatchCard({ match }: { match: MatchData }) {
  return (
    <article className="v2-mod-match">
      {match.competition && <p className="v2-mod-match__competition">{match.competition}</p>}
      <p className="v2-mod-match__teams">
        <span>{match.home}</span>
        <span className="v2-mod-match__score">{match.score ?? 'v'}</span>
        <span>{match.away}</span>
      </p>
      {match.status && (
        <p className={`v2-mod-match__status${/^live\b/i.test(match.status.trim()) ? ' v2-mod-match__status--live' : ''}`}>
          {match.status}
        </p>
      )}
    </article>
  );
}
