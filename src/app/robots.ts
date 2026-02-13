import { MetadataRoute } from 'next';
import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    // Get headers to construct request
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    // Create a NextRequest object for getAPIHostnameConfig
    const url = new URL('/robots.txt', `${protocol}://${host}`);
    const req = new NextRequest(url, {
      headers: {
        'x-forwarded-host': host,
        'x-forwarded-proto': protocol,
      },
    });

    const { apiHostname } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();

    // Fetch robots.txt from backend
    const response = await connection.makeApiRequest('/robots.txt', auth, {}, apiHostname);

    if (!response.ok) {
      throw new Error(`Failed to fetch robots.txt: ${response.status}`);
    }

    const text = await response.text();

    // Parse the robots.txt content
    const robots = parseRobotsTxt(text);

    // add here the customizations if needed

    return robots;
  } catch (error) {
    console.error('Error fetching robots.txt from backend:', error);

    // Return default robots.txt in case of error
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
    };
  }
}

function parseRobotsTxt(text: string): MetadataRoute.Robots {
  const lines = text.split('\n');
  const rules: Array<{
    userAgent: string | string[];
    allow?: string | string[];
    disallow?: string | string[];
    crawlDelay?: number;
  }> = [];

  let currentUserAgent: string | null = null;
  let currentRule: any = null;
  let sitemap: string | string[] | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const [key, ...valueParts] = trimmedLine.split(':');
    const value = valueParts.join(':').trim();
    const lowerKey = key.trim().toLowerCase();

    if (lowerKey === 'user-agent') {
      // Save previous rule if exists
      if (currentRule && currentUserAgent) {
        rules.push(currentRule);
      }

      // Start new rule
      currentUserAgent = value;
      currentRule = {
        userAgent: value,
      };
    } else if (lowerKey === 'allow' && currentRule) {
      if (!currentRule.allow) {
        currentRule.allow = value;
      } else if (Array.isArray(currentRule.allow)) {
        currentRule.allow.push(value);
      } else {
        currentRule.allow = [currentRule.allow, value];
      }
    } else if (lowerKey === 'disallow' && currentRule) {
      if (!currentRule.disallow) {
        currentRule.disallow = value;
      } else if (Array.isArray(currentRule.disallow)) {
        currentRule.disallow.push(value);
      } else {
        currentRule.disallow = [currentRule.disallow, value];
      }
    } else if (lowerKey === 'crawl-delay' && currentRule) {
      currentRule.crawlDelay = parseInt(value, 10);
    } else if (lowerKey === 'sitemap') {
      if (!sitemap) {
        sitemap = value;
      } else if (Array.isArray(sitemap)) {
        sitemap.push(value);
      } else {
        sitemap = [sitemap, value];
      }
    }
  }

  // Save last rule
  if (currentRule && currentUserAgent) {
    rules.push(currentRule);
  }

  return {
    rules:
      rules.length > 0
        ? rules
        : {
            userAgent: '*',
            allow: '/',
          },
    ...(sitemap && { sitemap }),
  };
}
