import { ErrorObject } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { authenticationHeader } from '@/utilities/security';

export const getPageData = async (hostname: string, slug: string[]) => {
  const pageData = await fetch(`${hostname}/${slug.join('/')}`);
  const pageDataJSON = await pageData.json();
  return pageDataJSON;
};

export const makeApiHostnameRequest = async (baseUrl: string, path: string, options: RequestInit = {}) => {
  const authHeaders = await authenticationHeader(true);

  const requestUrl = new URL(path, baseUrl).toString();

  const response = await fetch(requestUrl, {
    headers: {
      ...authHeaders,
    },
    ...options,
  });

  if (!response.ok) {
    try {
      const jsonResp = await response.json();
      throw {
        cause: jsonResp,
        status: response.status,
        url: requestUrl,
      } as ErrorObject;
    } catch {
      throw {
        cause: { message: 'Failed to parse error response' },
        status: response.status,
        url: requestUrl,
      } as ErrorObject;
    }
  }
  return response;
};
