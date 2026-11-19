import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';

/** About page describing the POC, rendered inside the v2 frame. */
export default function AboutPage({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--about">
        <h1 className="v2-special__title">About the Neon Next.js POC</h1>
        <p>
          This is the about page of this example of a &quot;front-end&quot; Next.js application able to render
          Neon&apos;s multiple headless SaaS sites. It is now rendering the <strong>{data.root.name}</strong> site,
          titled <em>{data.root.title}</em>.
        </p>
        <p>The scope of this proof of concept is to show how to implement:</p>
        <ul>
          <li>A secure, server-side rendered UI acting as a front-end application over the Neon multi-site CMS.</li>
          <li>
            A secure preview front end and live-admin client-side add-ons, letting Neon users inspect, modify and
            access extra information about the rendered content.
          </li>
        </ul>
        <p>
          The implementation is provided under the BSD-3-Clause license. The source code is hosted on GitHub:
        </p>
        <ul>
          <li>
            <a href="https://github.com/EidosMedia/neon-nextjs-poc2">Neon Next.js POC</a>
          </li>
          <li>
            <a href="https://github.com/EidosMedia/neon-frontoffice-ts-sdk">Neon Front Office TypeScript library</a>
          </li>
        </ul>
        <p>
          It is provided as-is, with no warranties, for any legal use, and can be forked and modified, together with
          the public Neon TypeScript front-office SDK, to implement your own front end.
        </p>
        <p className="v2-special__legal">Eidosmedia&reg; 2025&copy;</p>
      </div>
    </PageShell>
  );
}
