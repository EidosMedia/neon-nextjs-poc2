import React from 'react';
import Link from 'next/link';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const NotFound = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={{ siteNode: data.root }} />

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-20">
        <hr className="nyt-rule" />

        {/* Section label */}
        <span style={{
          fontFamily: 'var(--font-nav)',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: '#363636',
          display: 'block',
          marginTop: 6,
          marginBottom: 16,
        }}>
          Error 404
        </span>

        {/* Large 404 */}
        <div style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(5rem, 18vw, 10rem)',
          fontWeight: 700,
          lineHeight: 1,
          color: '#121212',
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
          color: '#121212',
          marginBottom: 16,
        }}>
          We're sorry. The page you requested could not be found.
        </h1>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.65, color: '#363636', marginBottom: 24 }}>
          Check the URL for errors, or use the search bar to find what you're looking for.{' '}
          <Link href="/" style={{ color: '#121212', textDecoration: 'underline' }}>
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
              color: '#FFFFFF',
              background: '#121212',
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
              color: '#121212',
              textDecoration: 'none',
              borderBottom: '1px solid #121212',
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
