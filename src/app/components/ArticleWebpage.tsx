import React from "react";
import { PageData, WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  zone: string;
  displayMainPicture: boolean;
};

const ArticleWebpage: React.FC<ArticleWepageProps> = async ({
  data,
  zone,
  displayMainPicture,
}) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, zone);
  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} data-layer="article">
          <a className="no-underline" href={linkedObjects[`${index}`].url}>
            <div className="self-stretch leading-snug">
              {displayMainPicture && (
                <img
                  alt="/static/img/nothumb.jpeg"
                  decoding="async"
                  data-nimg="1"
                  src={
                    linkedObject.links?.system?.mainPicture[0]
                      .dynamicCropsResourceUrls.Portrait_small
                  }
                  style={{ color: "transparent" }}
                />
              )}
            </div>
            <div className="text-black text-lg font-semibold font-['Source Sans Pro SemiBold'] leading-snug">
              {linkedObject.title}
            </div>
            <div className="text-black text-xs font-normal font-['Source Sans Pro'] leading-snug">
              {linkedObject.summary}
            </div>
            <div className="self-stretch text-[#5d5d5d] text-xs font-normal font-['Source Sans Pro'] leading-snug">
              {linkedObject.pubInfo.publicationTime}
            </div>
          </a>
          <br></br>
        </div>
      ))}
    </>
  );
};

export default ArticleWebpage;
