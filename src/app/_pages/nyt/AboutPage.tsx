import React from 'react';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Link from 'next/link';

const AboutPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[720px] mx-auto px-4 py-10">
        <hr className="nyt-rule" />
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: '#121212',
          margin: '8px 0 20px',
        }}>
          About — {data.root.title}
        </h1>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.75, color: '#2C2C2C' }} className="flex flex-col gap-5">
          <p>
            This is the About page of this example Next.js front-office application capable of rendering
            multiple NEON headless SaaS sites. Currently rendering the{' '}
            <strong>{data.root.name}</strong> site with title: <em>{data.root.title}</em>.
          </p>
          <p>
            The project demonstrates how to implement a secure server-side rendered UI on top of the NEON
            multi-site CMS, including preview front-end support and client-side add-ons for NeonApp users.
          </p>
          <p>
            Source code is hosted on{' '}
            <Link href="https://github.com/EidosMedia/neon-nextjs-poc2" style={{ color: '#121212', textDecoration: 'underline' }}>
              GitHub — NEON NextJS Poc2
            </Link>
            {' '}and provided under the BSD-3-Clause license.
          </p>
          <p style={{ fontSize: 14, color: '#666666' }}>
            Eidosmedia® 2025©
          </p>
        </div>
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default AboutPage;
