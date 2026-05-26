import React from 'react';
import Link from 'next/link';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const NotFound = ({ data }: { data: Site }) => {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={{ siteNode: data.root }} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-4">
        <div className="wire-panel-header mb-0 flex items-center justify-between">
          <span>ERROR RESPONSE</span>
          <span style={{ fontWeight: 400, color: '#CC0000' }}>404 Not Found</span>
        </div>

        <div className="bg-white border border-t-0 border-[#D4D4D4] flex">

          {/* Error metadata */}
          <div className="wire-meta-panel border-0 border-r border-[#D4D4D4] rounded-none hidden md:block" style={{ minWidth: 240 }}>
            <div className="wire-meta-panel-title">Response</div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">status</span>
              <span className="wire-meta-val" style={{ color: '#CC0000' }}>404</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">error</span>
              <span className="wire-meta-val">NOT_FOUND</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">site</span>
              <span className="wire-meta-val">{data.root.name}</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">timestamp</span>
              <span className="wire-meta-val">{now}</span>
            </div>
          </div>

          {/* Error body */}
          <div className="flex-1 p-8 flex flex-col justify-center gap-5">
            {/* Code-style error block */}
            <pre style={{
              fontFamily: 'var(--font-meta)',
              fontSize: 12,
              background: '#F5F5F5',
              border: '1px solid #D4D4D4',
              padding: '12px 16px',
              color: '#2C2C2C',
              whiteSpace: 'pre-wrap' as const,
              lineHeight: 1.6,
            }}>{`{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "The requested resource does not exist."
}`}</pre>

            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0A0A0A',
            }}>
              The requested resource could not be found.
            </h1>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65, color: '#2C2C2C' }}>
              Check the URL for errors, or search the feed for the content you need.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                style={{
                  fontFamily: 'var(--font-meta)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#FFFFFF',
                  background: '#0050FF',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              >
                Back to Feed
              </Link>
              <Link
                href="/search"
                style={{
                  fontFamily: 'var(--font-meta)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#0050FF',
                  textDecoration: 'none',
                  border: '1px solid #0050FF',
                  padding: '7px 16px',
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              >
                Search Feed
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default NotFound;
