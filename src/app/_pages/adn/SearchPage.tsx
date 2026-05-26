import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1280px] mx-auto px-3 py-5">
        {/* Section header */}
        <div className="mb-5">
          <span style={{
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: '#E30613',
            display: 'block',
            marginBottom: 4,
          }}>
            Ricerca
          </span>
          <h1 className="section-page-title">Risultati di ricerca</h1>
        </div>

        <div className="bg-white p-5 lg:p-8">
          <SearchResult data={data} />
        </div>
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
