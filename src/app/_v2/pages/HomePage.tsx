import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import PageShell from '../chrome/PageShell';
import StackedZones from '../zones/StackedZones';

type PageProps = { data: PageData<WebpageModel> };

const HomePage: React.FC<PageProps> = async ({ data }) => {
  const arena = getBrand(getActiveTheme(data)).header === 'arena';
  const hasMain = arena && (await connection.getDwxLinkedObjects(data, 'main')).length > 0;
  return (
    <PageShell data={data} hero={hasMain ? 'overlay' : undefined}>
      <StackedZones data={data} arenaHero={hasMain} />
    </PageShell>
  );
};

export default HomePage;
