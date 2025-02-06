import { PageData } from "@eidosmedia/neon-frontoffice-ts-sdk";
import { WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";
import Navbar from "../components/Navbar";
import TopSection from "../components/TopSection";
import BannerSection from "../components/BannerSection";
import ListSection from "../components/ListSection";

type PageProps = {
  data: PageData<WebpageModel>;
};

const Webpage: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={data}></Navbar>
      <BannerSection data={data} />
      <TopSection data={data} />
      <ListSection data={data} />
    </div>
  );
};

export default Webpage;
