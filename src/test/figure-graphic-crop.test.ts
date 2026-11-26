import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Figure from '@/app/components/contentElements/Figure';

const group = (attributes: Record<string, string>) =>
  ({
    nodeType: 'inline-media-group',
    attributes: {},
    value: '',
    elements: [{ nodeType: 'graphic', attributes, value: '', elements: [] }],
  }) as unknown as ContentElement;

test('applies the editor crop to a graphic', () => {
  const html = renderToStaticMarkup(
    createElement(Figure, {
      alt: 'logo',
      format: 'Wide',
      data: group({
        fileref: '/resources/logo.svg',
        tmx: '361 566 400 400',
        xtransform: 'translate(-557.05442 -638.40696) scale(3.027042 3.027042)',
      }),
    }),
  );
  expect(html).toContain('viewBox="0 0 400 400"');
  expect(html).toContain('transform="translate(-557.05442 -638.40696) scale(3.027042 3.027042)"');
  expect(html).toContain('href="/resources/logo.svg"');
});

test('ignores an unsafe xtransform', () => {
  const html = renderToStaticMarkup(
    createElement(Figure, {
      alt: 'logo',
      format: 'Wide',
      data: group({ fileref: '/resources/logo.svg', tmx: '1 1 1 1', xtransform: 'scale(2) url(x)' }),
    }),
  );
  expect(html).not.toContain('<svg');
});

test('renders an uncropped graphic as a plain image', () => {
  const html = renderToStaticMarkup(
    createElement(Figure, { alt: 'logo', format: 'Wide', data: group({ fileref: '/resources/logo.svg' }) }),
  );
  expect(html).toContain('<img');
  expect(html).not.toContain('<svg');
});
