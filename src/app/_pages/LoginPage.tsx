import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';

const LoginPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={{ siteNode: data.root }} />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <form className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Log in</h2>
          <p className="mb-4 text-gray-600">
            Enter your credential to access all The Globe products. By proceeding, you agree to out terms and
            conditions.
          </p>
          <p className="mb-4 text-gray-600">For information about how we use your data, see our privacy policy.</p>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              value=""
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              value=""
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default LoginPage;
