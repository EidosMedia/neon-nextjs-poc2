import { PageData } from "@eidosmedia/neon-frontoffice-ts-sdk";
import { WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";
import Navbar from "../components/Navbar";
import ArticleWebpage from "../components/ArticleWebpage";
import ArticleBanner from "../components/ArticleBanner";

type PageProps = {
  data: PageData<WebpageModel>;
};

const WebpageColumnsLayout: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="container mx-auto p-4">
      <Navbar data={data}></Navbar>
      <header className="bg-gray-100 text-white p-4 rounded-t-lg">
        <div className="banner-container flex items-center gap-4 relative">
          <p className="text-base font-normal text-white bg-red-600 px-4 py-2 rounded whitespace-nowrap">
            BREAKING NEWS
          </p>
          <div className="banner-container flex items-center gap-4 relative">
            <div className="scroll-content flex">
              <div className="banner-item">
                <ArticleBanner data={data} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md col-span-12 md:col-span-3">
          <ArticleWebpage data={data} zone="top" displayMainPicture={true} />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md col-span-12 md:col-span-6">
          <ArticleWebpage data={data} zone="footer" displayMainPicture={true} />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md col-span-12 md:col-span-3">
          <ArticleWebpage data={data} zone="list" displayMainPicture={false} />
        </div>
      </div>

      <footer className="bg-gray-800 text-white p-4 rounded-b-lg mt-4">
        <p className="text-center">Website Footer</p>
      </footer>
    </div>
  );
};

export default WebpageColumnsLayout;
