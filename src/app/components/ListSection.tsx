import React from "react";
import { PageData, WebpageModel } from "@eidosmedia/neon-frontoffice-ts-sdk";

type ListSectionProps = {
  data: PageData<WebpageModel>;
};

const ListSection: React.FC<ListSectionProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, "list");

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div
          key={linkedObject.id}
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          <div className="col-span-1">
            <a className="no-underline" href={linkedObjects[`${index}`].url}>
              <div className="p-4">
                <img
                  alt="/static/img/nothumb.jpeg"
                  width="200"
                  height="200"
                  decoding="async"
                  data-nimg="1"
                  src={
                    linkedObject.links.system.mainPicture[0]
                      .dynamicCropsResourceUrls.Portrait_small
                  }
                  className="w-48 h-48 object-cover"
                  style={{ color: "transparent" }}
                />
                <div className="mt-2">
                  <div>
                    <span className="text-base">{linkedObject.title}</span>
                  </div>
                  <h6 className="text-xl font-semibold">
                    {linkedObject.title}
                  </h6>
                  <p className="text-base">{linkedObject.summary}</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      ))}
    </>
  );
};

export default ListSection;
