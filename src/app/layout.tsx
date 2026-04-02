/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from './components/utilities/WebVitals';
import './globals.css';
import { ReloadListener } from './components/utilities/ReloadListener';
import StoreProvider from './StoreProvider';
import QueryProvider from './components/utilities/QueryProvider';
import { UIProvider } from './components/ui_lib';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neon POC site',
  description: 'Neon POC site for example purpose',
};

const importMap = {
  imports: {
    react: 'http://localhost:3000/react-shim.js',
    'react-dom': 'http://localhost:3000/react-dom-shim.js',
    'react/jsx-runtime': 'http://localhost:3000/jsx-runtime-shim.js',
  },
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
        {/* Import map MUST come before any module scripts — use dangerouslySetInnerHTML only here in <head> as a raw string to bypass React's script suppression */}
        <script
          type="importmap"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(importMap) }}
        />
      </head>

      <body className={inter.className}>
        <WebVitals />
        <ReloadListener />
        <StoreProvider>
          <QueryProvider>
            <UIProvider>{children}</UIProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
