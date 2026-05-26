import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../../components/SearchResult';
import Navbar from './Navbar';
import Footer from './Footer';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar data={{ siteNode: data.root }} />
      <div className="container mx-auto px-4 py-6">
        <SearchResult data={data} />
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
