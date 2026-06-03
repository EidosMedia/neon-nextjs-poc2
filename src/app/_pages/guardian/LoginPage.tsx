import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LoginForm from '../../components/LoginForm';

const LoginPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: guardian/LoginPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar data={{ siteNode: data.root }} />

      <div className="w-full max-w-[400px] mx-auto px-4 py-12">
        <div className="guardian-section-header">Sign in</div>
        <h1 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#052962',
          margin: '8px 0 24px',
        }}>
          Log In
        </h1>
        <LoginForm />
      </div>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
