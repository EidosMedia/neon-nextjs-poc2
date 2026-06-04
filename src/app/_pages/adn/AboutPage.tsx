import React from 'react';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage = ({ data }: { data: Site }) => {
  console.log('[NEON] render: adn/AboutPage');

  return (
    <div className="min-h-screen bg-white">
      <Navbar data={{ siteNode: data.root }} />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 border-l-4 border-red-600 pl-3">
          Chi siamo — {data.root.title}
        </h1>
        <div className="text-base text-gray-700 flex flex-col gap-4">
          <p>
            Questa è la pagina About di questa applicazione NextJs© di esempio in grado di renderizzare i siti headless
            multipli di NEON. Ora sta renderizzando il sito <strong>{data.root.name}</strong> con titolo:{' '}
            <em>{data.root.title}</em>.
          </p>
          <p>
            Il progetto dimostra come implementare un'UI server-side sicura sopra il CMS multi-sito NEON, incluso il
            preview front-end e i client-side addon per gli utenti NeonApp.
          </p>
          <p className="text-sm text-gray-500">
            Fornito sotto licenza BSD-3-Clause — Eidosmedia® 2025©
          </p>
        </div>
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default AboutPage;
