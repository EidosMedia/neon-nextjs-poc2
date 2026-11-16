import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import Search from '../special/Search';

/** Site search: the v2 client search (same endpoints, URL params and AI chat flow as the legacy page) inside the v2 frame. */
export default function SearchPage({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--search">
        <Search data={data} />
      </div>
    </PageShell>
  );
}
