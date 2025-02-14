import React from "react";
import { PageData, WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";

type ArticleBannerProps = {
  data: PageData<WebpageModel>;
};

const ArticleBanner: React.FC<ArticleBannerProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, "banner");
  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} data-layer="article" className="mr-8">
          <a className="no-underline" href={linkedObjects[`${index}`].url}>
            <div className="self-stretch leading-snug flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 mr-2"
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="CircleIcon"
              >
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"></path>
              </svg>
              <div className="text-black text-lg font-semibold font-['Source Sans Pro SemiBold'] leading-snug">
                {linkedObject.title}
              </div>
            </div>
          </a>
        </div>
      ))}
    </>
  );
};

export default ArticleBanner;
