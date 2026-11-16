import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ZoneRenderer from './ZoneRenderer';

export const PAGE_ZONES = ['main', 'context', 'insight1', 'insight2', 'insight3'] as const;

/** Zones stacked in v2 containers (container only emitted for non-empty zones). */
export default function StackedZones({ data, arenaHero }: { data: PageData<WebpageModel>; arenaHero?: boolean }) {
  return (
    <>
      {PAGE_ZONES.map((zone) => {
        const el = <ZoneRenderer key={zone} data={data} zone={zone} container />;
        return arenaHero && zone === 'main' ? (
          <section key={zone} className="v2-home-hero v2-home-hero--overlay">{el}</section>
        ) : el;
      })}
    </>
  );
}
