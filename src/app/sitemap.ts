import { MetadataRoute } from 'next';
import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get headers to construct request
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    // Create a NextRequest object for getAPIHostnameConfig
    const url = new URL('/sitemap.xml', `${protocol}://${host}`);
    const req = new NextRequest(url, {
      headers: {
        'x-forwarded-host': host,
        'x-forwarded-proto': protocol,
      },
    });

    const { apiHostname } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();

    // Fetch sitemap.xml from backend
    const response = await connection.makeApiRequest('/sitemap.xml', auth, {}, apiHostname);

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap.xml: ${response.status}`);
    }

    const text = await response.text();

    // Parse the sitemap.xml content
    const backendSitemap = parseSitemapXml(text);

    // Add local pages entries
    const baseUrl = `${protocol}://${host}`;
    const localPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];

    // Merge backend sitemap with local pages
    return [...localPages, ...backendSitemap];
  } catch (error) {
    console.error('Error fetching sitemap.xml from backend:', error);

    // Return local pages only in case of error
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const baseUrl = `${protocol}://${host}`;

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}

function parseSitemapXml(xml: string): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [];

  try {
    // Match all <url> blocks in the XML
    const urlRegex = /<url>([\s\S]*?)<\/url>/g;
    const matches = xml.matchAll(urlRegex);

    for (const match of matches) {
      const urlBlock = match[1];

      // Extract loc (required)
      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      if (!locMatch) continue;

      const url = locMatch[1].trim();

      // Extract optional fields
      const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
      const changefreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

      const entry: MetadataRoute.Sitemap[number] = {
        url,
        ...(lastmodMatch && { lastModified: new Date(lastmodMatch[1].trim()) }),
        ...(changefreqMatch && {
          changeFrequency: changefreqMatch[1].trim() as
            | 'always'
            | 'hourly'
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'yearly'
            | 'never',
        }),
        ...(priorityMatch && { priority: parseFloat(priorityMatch[1].trim()) }),
      };

      sitemap.push(entry);
    }
  } catch (error) {
    console.error('Error parsing sitemap XML:', error);
  }

  return sitemap;
}
