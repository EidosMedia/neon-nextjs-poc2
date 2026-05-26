import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LoginForm from '../../components/LoginForm';

const LoginPage = ({ data }: { data: Site }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar data={{ siteNode: data.root }} />
      <div className="container mx-auto px-4 py-10">
        <LoginForm />
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
