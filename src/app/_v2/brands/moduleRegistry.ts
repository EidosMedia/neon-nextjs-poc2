import type { ReactNode } from 'react';
import type { BrandKey } from './registry';
import type { BrandModuleProps } from './moduleData';
import NewsletterBand from './theglobe/modules/NewsletterBand';
import BreakingBanner from './sportsarena/modules/BreakingBanner';
import ResultsBand from './sportsarena/modules/ResultsBand';
import ScoreCard from './sportsarena/modules/ScoreCard';
import BreakingBar from './nextfrontier/modules/BreakingBar';
import LiveTicker from './nextfrontier/modules/LiveTicker';
import TopStoriesPanel from './nextfrontier/modules/TopStoriesPanel';
import HotTopics from './nextfrontier/modules/HotTopics';
import VerdictBox from './nextfrontier/modules/VerdictBox';
import SpecsPanel from './nextfrontier/modules/SpecsPanel';

/** Server components; list modules are async, hence the Promise in the return type. */
export type BrandModule = (props: BrandModuleProps) => ReactNode | Promise<ReactNode>;

/** Module components per brand, keyed by block `sys.type`. Kept apart from registry.ts so that file stays React-free. */
export const BRAND_MODULES: Record<BrandKey, Record<string, BrandModule>> = {
  theglobe: { newsletter: NewsletterBand },
  sportsarena: { breakingnews: BreakingBanner, results: ResultsBand, scorecard: ScoreCard },
  nextfrontier: {
    breakingnews: BreakingBar,
    liveticker: LiveTicker,
    topstories: TopStoriesPanel,
    hottopics: HotTopics,
    verdict: VerdictBox,
    specs: SpecsPanel,
  },
};

export const getBrandModules = (key: BrandKey) => BRAND_MODULES[key];
