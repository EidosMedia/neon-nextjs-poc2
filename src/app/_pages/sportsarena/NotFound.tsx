import React from 'react';
import Link from 'next/link';
import { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

const NotFound = ({ data }: { data: Site }) => {
  console.log('[NEON] render: sportsarena/NotFound');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar data={{ siteNode: data.root }} />

      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">
              We are sorry, but the page you are trying to visit no longer exists or is no longer available.
            </h1>
            <p className="text-base text-gray-600">
              You can try to check if the URL is correct, use the search bar to find the content, or{' '}
              <Link href="/" className="underline hover:text-primary">
                go to the homepage
              </Link>
              .
            </p>
          </div>

          <div className="flex gap-4 justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="106" height="150" viewBox="0 0 175 248" fill="none">
              <path
                d="M147.542 248C138.856 248 132.635 246.707 128.879 244.119C125.123 241.532 122.776 238.122 121.837 233.889C121.133 229.656 120.78 225.305 120.78 220.836V175.681H26.4097C17.9586 175.681 11.855 174.388 8.09898 171.801C4.34293 169.214 1.9954 165.921 1.05639 161.923C0.35213 157.69 0 153.339 0 148.871C0 146.519 0 144.637 0 143.226C0.234753 141.58 0.586883 140.051 1.05639 138.64L31.6917 21.1664C34.5087 10.348 38.2647 3.88052 42.9598 1.76388C47.8896 -0.587959 55.167 -0.587959 64.7918 1.76388C72.3039 3.64533 78.0554 6.46751 82.0462 10.2304C86.037 13.9934 87.3281 18.697 85.9196 24.3414L59.5099 125.587H120.78V26.1053C120.78 21.872 121.25 17.8739 122.189 14.1109C123.128 10.348 125.476 7.29067 129.232 4.93885C132.988 2.35183 139.326 1.05832 148.247 1.05832C156.698 1.05832 162.801 2.35183 166.557 4.93885C170.313 7.52585 172.543 10.936 173.248 15.1693C174.187 19.1674 174.656 23.5183 174.656 28.2219V221.189C174.656 225.893 174.187 230.361 173.248 234.595C172.309 238.593 169.961 241.885 166.205 244.472C162.449 246.824 156.228 248 147.542 248Z"
                fill="url(#default_404_a)"
              />
              <defs>
                <linearGradient id="default_404_a" x1="87.3281" y1="1.70356e-06" x2="12.9434" y2="380.945" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3969AC" />
                  <stop offset="1" stopColor="#C1D58A" />
                </linearGradient>
              </defs>
            </svg>

            <Logo data={{ siteNode: data.root }} size="large" />

            <svg xmlns="http://www.w3.org/2000/svg" width="106" height="150" viewBox="0 0 175 248" fill="none">
              <path
                d="M147.542 248C138.856 248 132.635 246.707 128.879 244.119C125.123 241.532 122.776 238.122 121.837 233.889C121.133 229.656 120.78 225.305 120.78 220.836V175.681H26.4097C17.9586 175.681 11.855 174.388 8.09898 171.801C4.34293 169.214 1.9954 165.921 1.05639 161.923C0.35213 157.69 0 153.339 0 148.871C0 146.519 0 144.637 0 143.226C0.234753 141.58 0.586883 140.051 1.05639 138.64L31.6917 21.1664C34.5087 10.348 38.2647 3.88052 42.9598 1.76388C47.8896 -0.587959 55.167 -0.587959 64.7918 1.76388C72.3039 3.64533 78.0554 6.46751 82.0462 10.2304C86.037 13.9934 87.3281 18.697 85.9196 24.3414L59.5099 125.587H120.78V26.1053C120.78 21.872 121.25 17.8739 122.189 14.1109C123.128 10.348 125.476 7.29067 129.232 4.93885C132.988 2.35183 139.326 1.05832 148.247 1.05832C156.698 1.05832 162.801 2.35183 166.557 4.93885C170.313 7.52585 172.543 10.936 173.248 15.1693C174.187 19.1674 174.656 23.5183 174.656 28.2219V221.189C174.656 225.893 174.187 230.361 173.248 234.595C172.309 238.593 169.961 241.885 166.205 244.472C162.449 246.824 156.228 248 147.542 248Z"
                fill="url(#default_404_b)"
              />
              <defs>
                <linearGradient id="default_404_b" x1="87.3281" y1="1.70356e-06" x2="12.9434" y2="380.945" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3969AC" />
                  <stop offset="1" stopColor="#C1D58A" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </main>

      <Footer data={{ siteNode: data.root }} />
    </div>
  );
};

export default NotFound;
