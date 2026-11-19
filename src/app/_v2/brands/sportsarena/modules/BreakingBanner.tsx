import BreakingStrip from '../../BreakingStrip';
import type { BrandModuleProps } from '../../moduleData';

/** Peach breaking banner: `title`, optional `summary`, first `main` link. */
export default function BreakingBanner({ block }: BrandModuleProps) {
  return <BreakingStrip block={block} brand="arena" />;
}
