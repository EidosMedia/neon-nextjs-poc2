import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import LoginForm from '../components/LoginForm';

const LoginPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={{ siteNode: data.root }} />
      <LoginForm />
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
