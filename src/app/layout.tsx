import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from './components/utilities/WebVitals';
import './globals.css';
import { ReloadListener } from './components/utilities/ReloadListener';
import StoreProvider from './StoreProvider';
import QueryProvider from './components/utilities/QueryProvider';
import { ReactShimExposer } from './components/utilities/ReactShimExposer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neon POC site',
  description: 'Neon POC site for example purpose',
};

export default async function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Import map so ESM uicomponent bundles can resolve bare React specifiers
            via self-hosted shim routes. The shims re-export the React instance
            that Next.js already loads, so no duplicate copies of React exist. */}
        <script
          type="importmap"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                react: '/api/shims/react',
                'react/jsx-runtime': '/api/shims/react-jsx-runtime',
                'react-dom': '/api/shims/react-dom',
                'react-dom/client': '/api/shims/react-dom-client',
                '@eidosmedia/react-marvin-components': '/api/shims/marvin',
              },
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@400..900&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
          rel="stylesheet"
        ></link>
        {/* Wire theme fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* NYT theme fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap"
          rel="stylesheet"
        />
        {/* ADN theme fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className={inter.className}>
        <WebVitals />
        <ReactShimExposer />
        <ReloadListener />
        <StoreProvider>
          <QueryProvider>{children}</QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
