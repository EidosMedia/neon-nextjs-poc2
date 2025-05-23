import React from 'react';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbarsite from '../components/Navbarsite';

const AboutPage = ({ data }: { data: Site }) => {
  return (
    <div className="container mx-auto max-w-2xl text-center">
      <Navbarsite data={data} />
      <h1 className="text-3xl font-bold my-2">
        Neon NextJS POC v2 About Page - Eidosmedia® 2025©
      </h1>
      <div className="text-left">
        <p className="mb-4">
          This is the about page of this example of a "front-end" NextJs© application able to render NEON's multiple
          headless SaaS sites.
        </p>
        <ul className="mb-4 list-inside pl-0">
          <span>The scope of this proof of concept is to show how to implement:</span>
          <li>
            🔹 Secure Server-side rendered UI, able to be a front-end application over the NEON multi-sites CMS.
          </li>
          <li>
            🔹 Implement a secure preview front end and secure live admin client-side addons, capable of allowing
            NeonApp users to inspect, modify, and access extra information of the rendered content.
          </li>
        </ul>
        <p className="mb-4">
          The code is OpenSource and hosted on GitHub. It is provided as-is, with no warranties, for any legal use and
          can be forked and modified, in conjunction with the Neon public TypeScript front-office SDK library, to
          implement your front-end application.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
