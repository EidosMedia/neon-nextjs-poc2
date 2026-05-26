import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        <div className="wire-panel-header flex items-center justify-between mb-0">
          <span>SEARCH</span>
          <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, fontWeight: 400, color: '#6B6B6B' }}>
            GET /api/v2/search
          </span>
        </div>

        <div className="bg-white border border-t-0 border-[#D4D4D4]">
          {/* Query info bar */}
          <div className="wire-article-toolbar border-b border-[#E8E8E8] flex-wrap gap-y-2">
            <span className="wire-article-toolbar-label">
              SITE:&nbsp;<span className="wire-article-toolbar-value">{data.root.name}</span>
            </span>
            <span className="wire-article-toolbar-label">
              FORMAT:&nbsp;<span className="wire-article-toolbar-value">JSON</span>
            </span>
            <span className="wire-article-toolbar-label hidden md:inline">
              ENDPOINT:&nbsp;<span className="wire-article-toolbar-value">/api/search</span>
            </span>
          </div>

          <div className="p-5">
            <SearchResult data={data} />
          </div>
        </div>
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
