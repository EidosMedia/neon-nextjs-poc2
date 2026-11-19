import { blockAttrs, readMatch, type BrandModuleProps } from '../../moduleData';
import MatchCard from './MatchCard';

/** Sidebar score card for one match: the block's own `attributes.teams|score|status|competition`. */
export default function ScoreCard({ block }: BrandModuleProps) {
  const match = readMatch(blockAttrs(block));
  if (!match) return null;
  return <div className="v2-mod-scorecard"><MatchCard match={match} /></div>;
}
