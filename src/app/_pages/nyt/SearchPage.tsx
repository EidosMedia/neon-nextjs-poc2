import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1280px] mx-auto px-4 py-8">
        {/* NYT-style section header */}
        <div className="mb-8">
          <hr className="nyt-rule" />
          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#121212',
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
