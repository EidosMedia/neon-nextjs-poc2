import { NextRequest, NextResponse } from 'next/server';
import { getAuthOptions } from '@/utilities/security';
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

    const result = await connection.login(loginOptions);

    // Set the webauthToken as a cookie
    const response = NextResponse.json(result);
    if (result.webauthToken) {
      response.cookies.set('webauth', result.webauthToken, {
        httpOnly: true,
        sameSite: process.env.DEV_MODE === 'false' ? 'none' : false,
        path: '/',
        secure: process.env.DEV_MODE === 'false',
      });
    }
    return response;

  } catch (error) {
    return handleServicesError(error);
  }
}