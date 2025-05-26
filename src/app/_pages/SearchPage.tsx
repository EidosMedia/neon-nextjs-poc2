import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbarsite from '../components/Navbarsite';
import SearchResult from '../components/SearchResult';
import Navbar from '../components/Navbar';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={{ siteNode: data.root }} />
      <div className="text-center">
        <h1 className="my-2">Search Page</h1>
      </div>
      <SearchResult data={data} />
    </div>
  );
};

export default SearchPage;
