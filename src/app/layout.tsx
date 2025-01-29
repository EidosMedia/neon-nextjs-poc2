import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from './components/web-vitals';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neon POC site',
  description: 'Neon POC site for example purpose',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebVitals />

        {children}
      </body>
    </html>
  );
}
