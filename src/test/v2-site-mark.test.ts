import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SiteMark from '@/app/_v2/chrome/SiteMark';

test('shows the brand disc when a site has no logo', () => {
  const html = renderToStaticMarkup(createElement(SiteMark, {
    label: 'Sports Arena', showInitials: true, logoUrl: ' ',
  }));
  expect(html).toContain('class="v2-header__disc">SA</span>');
  expect(html).not.toContain('<img');
});

test('keeps the disc while the site logo loads', () => {
  const html = renderToStaticMarkup(createElement(SiteMark, {
    label: 'Next Frontier', showInitials: false, logoUrl: '/resources/logo.png',
  }));
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('class="v2-header__disc"');
  expect(html).toContain('src="/resources/logo.png"');
  expect(html).toContain('opacity:0');
});

test('loads legacy Neon site logo paths through the frontend resource proxy', () => {
  const html = renderToStaticMarkup(createElement(SiteMark, {
    label: 'Sports Arena', showInitials: true,
    logoUrl: '/neon/api/site/resources/site-id/format/logo/sportsarena.png?version=1',
  }));
  expect(html).toContain('src="/resources/site-id/format/logo/sportsarena.png?version=1"');
  expect(html).not.toContain('src="/neon/api/site/resources/');
});
