import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import PageShell from '../chrome/PageShell';
import ZoneRenderer from '../zones/ZoneRenderer';

type PageProps = { data: PageData<WebpageModel> };

export const PAGE_ZONES = ['main', 'context', 'insight1', 'insight2', 'insight3'] as const;

/** Zones stacked in v2 containers. Shared by home and section pages. */
export function StackedZones({ data, arenaHero }: { data: PageData<WebpageModel>; arenaHero?: boolean }) {
  return (
    <>
      {PAGE_ZONES.map((zone) => {
        const el = (
          <div key={zone} className="v2-container">
            <ZoneRenderer data={data} zone={zone} />
          </div>
        );
        return arenaHero && zone === 'main' ? (
          <section key={zone} className="v2-home-hero v2-home-hero--overlay">{el}</section>
        ) : el;
      })}
    </>
  );
}

const HomePage: React.FC<PageProps> = async ({ data }) => {
  const arena = getBrand(getActiveTheme(data)).header === 'arena';
  return (
    <PageShell data={data} hero={arena ? 'overlay' : undefined}>
      <StackedZones data={data} arenaHero={arena} />
    </PageShell>
  );
};

export default HomePage;
