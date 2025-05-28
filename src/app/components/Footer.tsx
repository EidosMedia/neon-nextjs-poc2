import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Logo from './Logo';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import FooterMenu from './FooterMenu';

export default async function Footer({ data }: { data: PageData<BaseModel> }) {
  const site = await connection.getSiteByName(data.siteNode?.name || '');
  if (!site) {
    throw new Error('Site not found');
  }

  const menus = site.menus;
  console.log('Menus:', menus);

  // Helper to flatten children for links
  function flattenLinks(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    return items.map(child => ({
      label: child.label,
      href: child.url || child.ref || '#',
    }));
  }

  // Only consider the "Footer" menu
  const footerMenu = menus?.Footer;

  return (
    <div className="w-full">
      {/* Blue line */}
      <div className="w-full bg-primary mt-8 h-1.5 rounded" />
      {/* Logo and site name */}
      <div className="flex items-center space-x-2 py-4">
        <Logo data={data} size="small" />
        <span className="font-semibold text-lg">{data.siteNode.name}</span>
      </div>
      {/* 70% - 30% split section */}
      <div className="flex w-full">
        <div className="w-[70%] p-4">
          {/* Left 70% content */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {footerMenu?.items?.map((item: any, idx: number) => (
              <FooterMenu key={item.ref || idx} title={item.label} links={flattenLinks(item.items)} />
            ))}
          </div>
        </div>
        {/* Vertical blue line */}
        <div className="w-px bg-primary mx-2" />
        <div className="w-[30%] p-4">
          {/* Right 30% content */}
          <div>
            <div className="mb-6">
              <div className="font-bold mb-2">
                <a href="/about" className="hover:underline">
                  About
                </a>
              </div>
              <div className="font-bold mb-2">Account</div>
              <ul className="space-y-3 pl-4">
                <li>
                  <a href="#" className="hover:underline">
                    Subscribe to Premium
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Login to your Account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Create Account
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Subscribe to Newsletter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-2">Follow The Globe</div>
              <ul className="space-y-3 pl-4">
                <li>
                  <a href="#" className="hover:underline flex items-center space-x-2">
                    <Instagram size={18} />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline flex items-center space-x-2">
                    <Facebook size={18} />
                    <span>Facebook</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline flex items-center space-x-2">
                    <Twitter size={18} />
                    <span>Twitter</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline flex items-center space-x-2">
                    <Youtube size={18} />
                    <span>Youtube</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
