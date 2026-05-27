import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResult from '../components/SearchResult';
import NavbarSearch from '../components/NavbarSearch';

const SearchPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto">
      <NavbarSearch data={{ siteNode: data.root }} />
      <SearchResult data={data} />
    </div>
  );
};

export default SearchPage;
