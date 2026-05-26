import React from 'react';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage = ({ data }: { data: Site }) => {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  const META = [
    { key: 'service',   value: 'Wire Feed API' },
    { key: 'site',      value: data.root.name },
    { key: 'title',     value: data.root.title },
    { key: 'version',   value: 'v2.4.1' },
    { key: 'license',   value: 'BSD-3-Clause' },
    { key: 'retrieved', value: now },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        <div className="wire-panel-header mb-0">ABOUT — SERVICE INFORMATION</div>

        <div className="flex gap-4 bg-white border border-t-0 border-[#D4D4D4]">

          {/* Metadata panel */}
          <div className="wire-meta-panel border-0 border-r border-[#D4D4D4] rounded-none" style={{ minWidth: 280 }}>
            <div className="wire-meta-panel-title">Endpoint Metadata</div>
            {META.map(({ key, value }) => (
              <div key={key} className="wire-meta-row">
                <span className="wire-meta-key">{key}</span>
                <span className="wire-meta-val">{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="flex-1 p-6">
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0A0A0A',
              marginBottom: 16,
            }}>
              Wire Feed — Content Distribution Platform
            </h1>
            <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65, color: '#2C2C2C' }}>
              <p>
                This is a Next.js front-office application demonstrating multi-site headless rendering
                on top of the NEON CMS platform. Currently serving the{' '}
                <strong>{data.root.name}</strong> site — <em>{data.root.title}</em>.
              </p>
              <p>
                The Wire theme presents content in a functional, data-first layout suited for API
                consumers, editorial integrations, and wire agency workflows.
              </p>
              <div style={{ fontFamily: 'var(--font-meta)', fontSize: 11, color: '#6B6B6B', marginTop: 8 }}>
                <div>Source: <a href="https://github.com/EidosMedia/neon-nextjs-poc2" style={{ color: '#0050FF' }}>github.com/EidosMedia/neon-nextjs-poc2</a></div>
                <div style={{ marginTop: 4 }}>SDK: <a href="https://github.com/EidosMedia/neon-frontoffice-ts-sdk" style={{ color: '#0050FF' }}>neon-frontoffice-ts-sdk</a></div>
                <div style={{ marginTop: 4 }}>License: BSD-3-Clause · Eidosmedia® 2025©</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default AboutPage;
