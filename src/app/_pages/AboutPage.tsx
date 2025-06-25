import React from 'react';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto text-center flex flex-col items-center justify-center">
      <Navbar data={{ siteNode: data.root }} />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold my-2">
          Neon NextJS POC v2 {data.root.title} site's About Page
          <br />
          Eidosmedia® 2025©
        </h1>
        <div className="text-left text-base">
          <p className="text-base mt-3 mb-1">
            This is the about page of this example of a "front-end" NextJs© application able to render NEON's multiple
            headless SaaS sites. Now is rendering the <strong>{data.root.name}</strong> site that has title:{' '}
            <em>{data.root.title}</em>.
          </p>
          <ul className="text-base mt-3 mb-1 list-disc list-inside">
            The scope of this proof of concept is to show how to implement:
            <li>Secure Server-side rendered UI, able to be a front-end application over the NEON multi-sites CMS.</li>
            <li>
              Implement a secure preview front end and secure live admin client-side addons, capable of allowing NeonApp
              users to inspect, modify, and access extra information of the rendered content.
            </li>
          </ul>
          <p className="text-base mt-3 mb-1">
            The implemententation is provided under the BSD-3-Clause license, allowing usages as specified by the
            license.
          </p>
          <ul className="text-base mt-3 mb-1 list-disk list-inside">
            The source code is hosted on GitHub.
            <li>
              <a className="text-base" href="https://github.com/EidosMedia/neon-nextjs-poc2">
                NEON NextJS Poc2
              </a>
            </li>
            <li>
              <a className="text-base" href="https://github.com/EidosMedia/neon-frontoffice-ts-sdk">
                NEON Front Office TypeScript library
              </a>
            </li>
          </ul>
          <p className="text-base mt-3 mb-1">
            It is provided as-is, with no warranties, for any legal use and can be forked and modified, in conjunction
            with the Neon public TypeScript front-office SDK library, to implement your front-end application.
          </p>
        </div>
      </div>
      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default AboutPage;
