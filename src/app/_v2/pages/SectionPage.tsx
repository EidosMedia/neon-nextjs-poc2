import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import StackedZones from '../zones/StackedZones';

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
      <StackedZones data={data} />
    </PageShell>
  );
};

export default SectionPage;
