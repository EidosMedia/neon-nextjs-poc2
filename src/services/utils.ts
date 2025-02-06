import { NextRequest } from 'next/server';
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { PageData, BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel,WebpageNodeModel } from '@/types/models/WebpageModel';
declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

export const getAPIHostnameConfig = async (request: NextRequest) => {
  const protocol = request.headers.get('x-forwarded-protocol') || 'http';

  const forwardedHostname = request.headers.get('x-forwarded-host');

  if (forwardedHostname === null) {
    throw new Error('x-forwarded-host header not found');
  }

  const apiHostnameConfig = await connection.resolveApiHostname(
    `${protocol}://${forwardedHostname}`
  );

  apiHostnameConfig.apiHostname = `${protocol}://${apiHostnameConfig.apiHostname}`;
  return apiHostnameConfig;
};

export const getDwxLinkedObjects = async (pageData: PageData<WebpageModel>, zoneName?: string): Promise<WebpageNodeModel[]> => {
  const zones = Object.keys(pageData.model.data.links?.pagelink || []);

  if (!zoneName || !zones.length) {
      const allLinkedObjects = await Promise.all(
        zones.map(zone => getDwxLinkedObjects(pageData, zone))
      );
      return allLinkedObjects.flat();
  }

  let linkedObjects: WebpageNodeModel[] = [];

  try {
      linkedObjects = pageData.model.data.links?.pagelink[zoneName].map(link => {
          let webPageBaseNode = pageData.model.nodes[link.targetId];
          
          const mainPicureId = webPageBaseNode.links.system.mainPicture[0].targetId;
          const mainPicuretNode = pageData.model.nodes[mainPicureId];

          const webpageNode: WebpageNodeModel = {
            ...webPageBaseNode,
            mainPicture: mainPicuretNode.resourceUrl
          };
          
          return webpageNode;
      });
  } catch (e) {}
  return linkedObjects;
};