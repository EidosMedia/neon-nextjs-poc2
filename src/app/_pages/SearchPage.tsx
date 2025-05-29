import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../components/SearchResult';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={{ siteNode: data.root }} />
      <SearchResult data={data} />
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default SearchPage;
