import React from 'react';
import Link from 'next/link';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const NotFound = ({ data }: { data: Site }) => {
  console.log('[NEON] render: foghorn/NotFound');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      <Navbar data={{ siteNode: data.root }} />

      <main className="flex-1 w-full max-w-[740px] mx-auto px-4 py-20">
        <div className="foghorn-section-header">Error 404</div>

        <div style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(5rem, 18vw, 10rem)',
          fontWeight: 700,
          lineHeight: 1,
          color: '#052962',
          letterSpacing: '-0.04em',
          marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          color: '#052962',
          marginBottom: 16,
        }}>
          We&apos;re sorry. The page you requested could not be found.
        </h1>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.65, color: '#333333', marginBottom: 24 }}>
          Check the URL for errors, or use the search bar to find what you&apos;re looking for.{' '}
          <Link href="/" style={{ color: '#052962', textDecoration: 'underline' }}>
            Return to the homepage.
          </Link>
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-nav)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#ffffff',
              background: '#052962',
              padding: '10px 20px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Go to Home
          </Link>
          <Link
            href="/search"
            style={{
              fontFamily: 'var(--font-nav)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#052962',
              textDecoration: 'none',
              borderBottom: '1px solid #052962',
              paddingBottom: 2,
            }}
          >
            Search
          </Link>
        </div>
      </main>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default NotFound;
