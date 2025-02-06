import { PageData } from "@eidosmedia/neon-frontoffice-ts-sdk";
import { WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";
import Navbar from "../components/Navbar";
import { NeonConnection } from "@eidosmedia/neon-frontoffice-ts-sdk";
import TopSection from "../components/TopSection";

type PageProps = {
  data: PageData<WebpageModel>;
};

declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

const Webpage: React.FC<PageProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, "banner");
  const linkedObjectstop = await connection.getDwxLinkedObjects(data, "top");

  return (
    <div className="container mx-auto">
      <Navbar data={data}></Navbar>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} className="p-4">
          <a className="no-underline" href={linkedObjects[`${index}`].url}>
            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-gray-500"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  data-testid="CircleIcon"
                >
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"></path>
                </svg>
                <p className="text-base font-medium text-gray-700">
                  BREAKING NEWS
                </p>
              </div>
              <h6 className="mt-2 text-lg font-semibold text-gray-900">
                {linkedObject.title}
              </h6>
            </div>
          </a>
        </div>
      ))}

      {linkedObjectstop.map((linkedObjecttop: any, index: number) => (
          <TopSection
              key={linkedObjecttop.id}
              linkedObjecttop={{
                id: linkedObjecttop.id,
                title: linkedObjecttop.title,
                imageUrl: linkedObjecttop.links.system.mainPicture[0].dynamicCropsResourceUrls.Portrait_small,
                link: linkedObjecttop[`${index}`].url,
                summary: linkedObjecttop.summary
              }}
          />
      ))}

    </div>
  );
};

export default Webpage;
