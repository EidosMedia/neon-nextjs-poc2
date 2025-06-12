import { NextRequest } from 'next/server';
import { authenticationHeader, getAuthOptions } from '@/utilities/security';
import { getAPIHostnameConfig, handleServicesError } from '../../../../services/utils';
import { ErrorObject, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { LoginRequestOptions } from '@/neon-frontoffice-ts-sdk/src/services/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiHostname } = await getAPIHostnameConfig(request);

    const loginOptions: LoginRequestOptions = {
      apiHostname: apiHostname,
      name: body.name,
      password: body.password,
      rememberMe: body.rememberMe,
    };

    return await connection.login(
      loginOptions
    );

  } catch (error) {
    return handleServicesError(error);
  }
}