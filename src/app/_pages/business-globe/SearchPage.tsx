import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: business-globe/SearchPage');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bgl-cream, #FFF1E5)' }}>
      <Navbar data={{ siteNode: data.root }} />
      <div className="bgl-home-wrap">
        <SearchResult data={data} />
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
