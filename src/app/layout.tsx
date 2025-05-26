import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from './components/utilities/WebVitals';
import './globals.css';
import { ReloadListener } from './components/utilities/ReloadListener';
import StoreProvider from './StoreProvider';

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
      </head>

      <body className={inter.className}>
        <WebVitals />
        <ReloadListener />

        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
