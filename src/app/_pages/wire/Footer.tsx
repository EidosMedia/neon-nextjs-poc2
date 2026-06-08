import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const API_LINKS = [
  { label: 'REST API Docs', href: '/api/docs' },
  { label: 'GraphQL Endpoint', href: '/api/graphql' },
  { label: 'Webhook Guide', href: '/api/webhooks' },
  { label: 'SDKs', href: '/api/sdks' },
  { label: 'Status', href: '/status' },
  { label: 'Rate Limits', href: '/api/rate-limits' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Content License', href: '/license' },
  { label: 'Contact', href: '/contact' },
];

export default async function Footer({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: wire/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name || 'Wire Feed';
  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <footer data-section="footer" className="w-full mt-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Brand + build info */}
        <div className="flex flex-col gap-1">
          <span className="wire-brand">{siteName}</span>
          <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, color: '#6B6B6B', letterSpacing: '0.06em' }}>
            Content Distribution Platform · v2.4.1 · {utcString}
          </span>
        </div>

        {/* API links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {API_LINKS.map(link => (
            <a key={link.href} href={link.href} className="text-xs hover:text-[#0050FF]">
              {link.label}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LEGAL_LINKS.map(link => (
            <a key={link.href} href={link.href} className="text-xs">
              {link.label}
            </a>
          ))}
          <span className="text-xs">© {now.getFullYear()} Wire Feed Inc.</span>
        </div>

      </div>
    </footer>
  );
}
