import { WebpageModel } from "@/types/models/WebpageModel";
import Navbar from "../components/Navbar";
import { PageData } from "@eidosmedia/neon-frontoffice-ts-sdk";

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  return (
    <div>
      <Navbar data={data}></Navbar>
      {JSON.stringify(data.model)}
    </div>
  );
};

export default Section;
