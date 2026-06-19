import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: financier/SearchPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-bg, #f6f6f6)' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1300px] mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="financier-section-header">Search</div>
          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: 'var(--color-neutral-primary)',
            marginTop: 8,
          }}>
            Search
          </h1>
        </div>

        <SearchResult data={data} />
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
