import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LoginForm from '../../components/LoginForm';

const LoginPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: wire/LoginPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        <div className="wire-panel-header mb-0">AUTHENTICATION — POST /api/v2/auth/token</div>

        <div className="bg-white border border-t-0 border-[#D4D4D4] flex">

          {/* Left: auth metadata */}
          <div className="wire-meta-panel border-0 border-r border-[#D4D4D4] rounded-none hidden md:block" style={{ minWidth: 240 }}>
            <div className="wire-meta-panel-title">Request Info</div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">method</span>
              <span className="wire-meta-val">POST</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">endpoint</span>
              <span className="wire-meta-val">/auth/token</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">content-type</span>
              <span className="wire-meta-val">application/json</span>
            </div>
            <div className="wire-meta-row">
              <span className="wire-meta-key">response</span>
              <span className="wire-meta-val">Bearer JWT</span>
            </div>
          </div>

          {/* Right: login form */}
          <div className="flex-1 p-8 flex flex-col justify-center" style={{ maxWidth: 400 }}>
            <div style={{
              fontFamily: 'var(--font-meta)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              color: '#6B6B6B',
              marginBottom: 16,
            }}>
              Credentials
            </div>
            <LoginForm />
          </div>

        </div>
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
