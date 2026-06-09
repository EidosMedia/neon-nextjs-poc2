import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { resolvePageComponent } from '../_themeRouter';
import LoggedUserBar from '../components/LoggedUserOverlay/LoggedUserBar';
import type { Metadata } from 'next';
import { getAuthOptions } from '@/utilities/security';
import UIStyleGuide from '../components/baseComponents/UIStyleGuide';
import * as DefaultPages from '../_pages';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentHeaders = await headers();
  const hostname = currentHeaders.get('x-neon-backend-url');
  const siteName = currentHeaders.get('x-neon-site-name');
  const viewStatus = currentHeaders.get('x-neon-view-status') as string;
  const path = currentHeaders.get('x-neon-pathname') as string;
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;

  if (slug && slug.length === 1) {
    const site = await connection.findSite(siteName ?? '');

    switch (slug[0]) {
      case 'ui': {
        const theme = site?.root.attributes?.theme ?? 'default';
        return (
          <div className="root" data-theme={theme}>
            <UIStyleGuide />
          </div>
        );
      }

      case 'search':
        if (site) {
          const theme = site.root.attributes?.theme ?? 'default';
          const SearchPage =
            (resolvePageComponent('SearchPage', theme) as React.ComponentType<{ data: typeof site }>) ??
            DefaultPages.SearchPage;
          return (
            <div className="root" data-theme={theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <SearchPage data={site} />
            </div>
          );
        }
      case 'about':
        if (site) {
          const theme = site.root.attributes?.theme ?? 'default';
          const AboutPage =
            (resolvePageComponent('AboutPage', theme) as React.ComponentType<{ data: typeof site }>) ??
            DefaultPages.AboutPage;
          return (
            <div className="root" data-theme={theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <AboutPage data={site} />
            </div>
          );
        }
      case 'login':
        if (site) {
          const theme = site.root.attributes?.theme ?? 'default';
          const LoginPage =
            (resolvePageComponent('LoginPage', theme) as React.ComponentType<{ data: typeof site }>) ??
            DefaultPages.LoginPage;
          return (
            <div className="root" data-theme={theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <LoginPage data={site} />
            </div>
          );
        }
    }
  }

  const auth = await getAuthOptions();
  const url = resolveUrl(hostname, path, id as string);

  let pageData;

  try {
    pageData = await connection.makePageRequest(url, auth, {
      redirect: 'manual',
      cache: 'no-cache',
    });
  } catch (error: any) {
    if (error.status === 404) {
      notFound();
    }

    // handle 401 and 403 unauthorized
    if (error.status === 401 || error.status === 403 || error.status === 410) {
      notFound();
    }
  }

  if (!pageData) {
    notFound();
  }

  // handle redirection
  if (pageData.status > 300 && pageData.status < 400) {
    const newLocation = pageData.headers.get('Location') as string;
    redirect(newLocation);
  }

  const pageDataJSON = await pageData.json();
  console.log('Current page model', pageDataJSON);

  if (process.env.NODE_ENV === 'development' && pageData.status >= 500) {
    throw new Error(pageDataJSON.model.data.trace);
  }

  const siteLive = await connection.findSite(siteName ?? '', 'live');
  const sitePreview = await connection.findSite(siteName ?? '', 'preview');

  pageDataJSON.liveHost = siteLive?.root.hostname;
  pageDataJSON.previewHost = sitePreview?.root.hostname;

  const theme: string = pageDataJSON?.siteNode?.attributes?.theme ?? 'default';
  const baseType = pageDataJSON?.model?.data?.sys?.baseType as string;
  const type = pageDataJSON?.model?.data?.sys?.type as string;
  console.log('Resolving page for baseType:', baseType, 'type:', type, 'theme:', theme);

  // For article longform, use a sub-type key so themes can differentiate
  const componentKey =
    baseType === 'article' && type === 'longform' ? 'ArticleLongform'
    : baseType === 'webpage' && type === 'newsletter' ? 'NewsletterWebpage'
    : resolveBaseTypeKey(baseType);
  const PageComponent = resolvePageComponent(componentKey, theme);

  return (
    <div className="root" data-theme={theme}>
      <LoggedUserBar
        data={{
          ...pageDataJSON,
          editUrl: `${process.env.NEON_APP_URL}/neon/app/neon.html#open/${pageDataJSON.model.data.id}`,
        }}
      />
      {PageComponent ? (
        <PageComponent data={pageDataJSON} />
      ) : (
        <DefaultPages.Article data={pageDataJSON} />
      )}
    </div>
  );
}

function resolveBaseTypeKey(baseType: string): string {
  const map: Record<string, string> = {
    webpage: 'WebpageColumnsLayout',
    sectionwebpage: 'SectionWebPage',
    homewebpage: 'HomeWebPage',
    section: 'DefaultSection',
    site: 'DefaultLanding',
    liveblog: 'Liveblog',
    article: 'Article',
  };
  return map[baseType] ?? 'Article';
}

function resolveUrl(hostname: string | null, path: string, id?: string | null) {
  const baseUrl = `${hostname}${path}`;
  return id !== undefined && id ? `${baseUrl.replace(/\/$/, '')}/${id}` : baseUrl;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const currentHeaders = await headers();

  const hostname = currentHeaders.get('x-neon-backend-url');
  const path = currentHeaders.get('x-neon-pathname') as string;
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;
  const auth = await getAuthOptions();

  const url = resolveUrl(hostname, path, id as string);
  try {
    let title;

    if (slug && slug.length === 1) {
      switch (slug[0]) {
        case 'search':
          return { title: 'Search' };
        case 'about':
          return { title: 'About' };
        case 'login':
          return { title: 'Login' };
      }
    }
    const pageData = await connection.makePageRequest(url, auth, {
      redirect: 'manual',
      cache: 'no-cache',
    });

    if (pageData.status == 200) {
      const pageDataJSON = await pageData.json();

      if (!title) {
        title = pageDataJSON.model.data.title;
      }

      return {
        title: `${pageDataJSON.siteData.siteName} - ${title}`,
        description: pageDataJSON.model.data.summary,
      };
    } else {
      return {
        title: 'Error',
        description: 'Failed to generate metadata.',
      };
    }
  } catch (error) {
    console.warn('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'Failed to generate metadata.',
    };
  }
}
