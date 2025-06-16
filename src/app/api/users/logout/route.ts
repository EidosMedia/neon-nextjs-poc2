import { NextRequest, NextResponse } from 'next/server';
import { authenticationHeader, getAuthOptions } from '@/utilities/security';
import { getAPIHostnameConfig, handleServicesError } from '../../../../services/utils';
import { ErrorObject, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { LoginRequestOptions } from '@/neon-frontoffice-ts-sdk/src/services/users';

export async function POST(request: NextRequest) {
  try {
   
    // Set the webauthToken as a cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
      response.cookies.set('webauth', '', {
        httpOnly: true,
        expires: new Date(0), // Expire the cookie
        sameSite: process.env.DEV_MODE === 'false' ? 'none' : false,
        path: '/',
        secure: process.env.DEV_MODE === 'false',
      });
    
    return response;

  } catch (error) {
    return handleServicesError(error);
  }
}