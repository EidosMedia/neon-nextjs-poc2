import { blockItems, blockTitle, readMatch, type BrandModuleProps } from '../../moduleData';
import MatchCard from './MatchCard';

/**
 * Results band of up to 4 score cards. Each linked `main` item is one match and reads
 * `attributes.teams` ("Home|Away"), `score`, `status`, `competition`. Items without teams are skipped.
 */
export default async function ResultsBand({ block }: BrandModuleProps) {
  const matches = (await blockItems(block, 12))
    .map((i) => readMatch(i.attrs))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .slice(0, 4);
  if (matches.length === 0) return null;
  const title = blockTitle(block) ?? 'Results and fixtures';
  return (
    <section className="v2-mod-results" aria-label={title}>
      <div className="v2-container">
        <h2 className="v2-mod-results__title">{title}</h2>
        <div className="v2-mod-results__row">
          {matches.map((m, i) => <MatchCard key={i} match={m} />)}
        </div>
      </div>
    </section>
  );
}
