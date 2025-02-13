import React from "react";
import { PageData, WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";

type BannerSectionProps = {
  data: PageData<WebpageModel>;
};

const BannerSection: React.FC<BannerSectionProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, "banner");

  return (
    <>
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
    </>
  );
};

export default BannerSection;
