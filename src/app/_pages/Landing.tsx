import { PageData } from "@eidosmedia/neon-frontoffice-ts-sdk";
import Navbar from "../components/Navbar";
import { WebpageModel } from "@/types/models/WebpageModel";

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  return (
    <div>
      <Navbar data={data}></Navbar>
      {JSON.stringify(data)}
    </div>
  );
};

export default Landing;
