import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const NotFound = ({ data }: { data: Site }) => {
  console.log('[NEON] render: adn/NotFound');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={{ siteNode: data.root }} />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-20">
        <div className="bg-white p-10 flex flex-col md:flex-row items-center gap-12">

          {/* 404 visual: two "4" numerals in red flanking the ADN logo */}
          <div className="flex items-center gap-6 shrink-0">
            <span className="adn-404-numeral" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '9rem',
              fontWeight: 800,
              lineHeight: 1,
              color: '#E30613',
            }}>
              4
            </span>

            <Image
              src="/adn/Adn_Logo.svg"
              alt="ADNKronos"
              width={160}
              height={80}
              style={{ height: 80, width: 'auto' }}
            />

            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '9rem',
              fontWeight: 800,
              lineHeight: 1,
              color: '#E30613',
            }}>
              4
            </span>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-5">
            {/* Red section label */}
            <span style={{
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#E30613',
            }}>
              Pagina non trovata
            </span>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#1A1A1A',
            }}>
              Ci dispiace, la pagina che stai cercando non esiste o non è più disponibile.
            </h1>

            <p style={{
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 14,
              color: '#555555',
              lineHeight: 1.6,
            }}>
              Controlla che l&apos;indirizzo sia corretto, usa la barra di ricerca per trovare il contenuto, oppure{' '}
              <Link
                href="/"
                style={{ color: '#E30613', textDecoration: 'underline' }}
              >
                torna alla homepage
              </Link>
              .
            </p>

            <div className="flex items-center gap-3 mt-2">
              <Link
                href="/"
                className="adn-ultimora-btn"
                style={{
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  backgroundColor: '#E30613',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Homepage
              </Link>
              <Link
                href="/search"
                style={{
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#1A1A1A',
                  textDecoration: 'none',
                  borderBottom: '1px solid #1A1A1A',
                  paddingBottom: 1,
                }}
              >
                Cerca
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
