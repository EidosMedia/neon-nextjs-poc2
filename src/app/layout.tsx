import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from './components/utilities/WebVitals';
import './globals.css';
import { ReloadListener } from './components/utilities/ReloadListener';

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
      <body className={inter.className}>
        <WebVitals />
        <ReloadListener />

        {children}
      </body>
    </html>
  );
}
