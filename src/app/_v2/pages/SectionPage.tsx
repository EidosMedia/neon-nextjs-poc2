import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import StackedZones from '../zones/StackedZones';
import EmptySection from '@/app/components/EmptySection';
import { sectionHasObjects } from '@/utilities/sectionRecirculation';

type PageProps = { data: PageData<WebpageModel> };

// Tabs are omitted: the section model does not expose child sections.
const SectionPage: React.FC<PageProps> = async ({ data }) => {
  const { title, summary } = data.model.data;
  return (
    <PageShell data={data}>
      <header className="v2-container v2-section-head">
        <p className="v2-section-head__kicker">Section</p>
        <h1 className="v2-section-head__title">{title}</h1>
        {summary && <p className="v2-section-head__desc">{summary}</p>}
      </header>
      {sectionHasObjects(data) ? <StackedZones data={data} /> : <EmptySection data={data} v2 showTitle={false} />}
    </PageShell>
  );
};

export default SectionPage;
