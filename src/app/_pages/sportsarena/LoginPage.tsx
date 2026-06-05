import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LoginForm from '../../components/LoginForm';

const LoginPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: sportsarena/LoginPage');

  return (
    <div className="container mx-auto">
      <Navbar data={{ siteNode: data.root }} />
      <LoginForm />
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
