import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbarsite from "../components/Navbarsite";
import SearchResult from "../components/SearchResult";



const SearchPage  = ( { data }: { data: Site }) => {


    return (
        <div className="container mx-auto">

                <Navbarsite data={data} />
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: '8px'}}>Search Page</h1>
                </div>
                <SearchResult data={data} />
        </div>
    );
};

export default SearchPage;
