import BreakingStrip from '../../BreakingStrip';
import type { BrandModuleProps } from '../../moduleData';

/** Pink breaking bar: `title`, optional `summary`, first `main` link. */
export default function BreakingBar({ block }: BrandModuleProps) {
  return <BreakingStrip block={block} brand="frontier" />;
}
