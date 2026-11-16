import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import SearchResult from '../../components/SearchResult';

/** Site search: the legacy client search/result logic inside the v2 frame. */
export default function SearchPage({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--search">
        <SearchResult data={data} />
      </div>
    </PageShell>
  );
}
