import { NextRequest } from 'next/server';
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { PageData, PageDataModel, BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
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

export const getDwxLinkedObjects = async (pageData: PageData<PageDataModel>, zoneName?: string): Promise<BaseModel[]> => {
  const zones = Object.keys(pageData.model.data.links?.pagelink || []);

  if (!zoneName || !zones.length) {
      // When not specifying a zone, return all objects from all zones
      //return zones.reduce((acc, zone) => [...acc, ...getDwxLinkedObjects(pageData, zone)], []);
      return [];
  }

  let linkedObjects: BaseModel[] = [];

  try {
      linkedObjects = pageData.model.data.links?.pagelink[zoneName].map(link => {
          return pageData.model.nodes[link.targetId];
      });
  } catch (e) {}
  return linkedObjects;
};