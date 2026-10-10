import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ZoneHead from '@/app/components/webpage/ZoneHead';
import { sanitizeZoneSummary } from '@/lib/accessories/sanitizeZoneSummary';

const render = (props: Parameters<typeof ZoneHead>[0]) => renderToStaticMarkup(createElement(ZoneHead, props));

describe('ZoneHead', () => {
  test('renders the title as escaped text with the card title base and the zone bold state', () => {
    const html = render({
      head: { title: '<img src=x onerror=alert(1)> & more' },
      cardTitle: 'h1',
      shape: { bold: true, border: false },
    });

    expect(html).toBe(
      '<div class="acc-zone-head" data-card-title="h1">' +
        '<h2 class="acc-zone-title acc-title-bold">&lt;img src=x onerror=alert(1)&gt; &amp; more</h2></div>',
    );
  });

  test('renders the regular title weight class when bold is off', () => {
    expect(render({ head: { title: 'T' }, cardTitle: 'h2', shape: { bold: false, border: false } })).toContain(
      'acc-zone-title acc-title-regular',
    );
  });

  test('renders only the summary, with html typography and per-paragraph alignment', () => {
    const summary = sanitizeZoneSummary(
      '<p>One <strong>two</strong><br>three <a href="/x">link</a></p><p style="text-align: right">Four</p>',
      { maxVisible: 2000 },
    );

    expect(render({ head: { summary }, cardTitle: 'hero' })).toBe(
      '<div class="acc-zone-head" data-card-title="hero"><div class="acc-zone-summary">' +
        '<p>One <strong>two</strong><br/>three <a href="/x">link</a></p><p style="text-align:right">Four</p></div></div>',
    );
  });

  test('renders title above summary when both are present', () => {
    const summary = sanitizeZoneSummary('<p>S</p>', { maxVisible: 2000 });
    const html = render({ head: { title: 'T', summary }, cardTitle: 'h2' });

    expect(html.indexOf('acc-zone-title')).toBeGreaterThan(-1);
    expect(html.indexOf('acc-zone-title')).toBeLessThan(html.indexOf('acc-zone-summary'));
  });

  test('never renders raw html from a summary that carries script or event handlers', () => {
    const summary = sanitizeZoneSummary('<p onclick="x()">a<script>alert(1)</script><a href="javascript:x()">b</a></p>', {
      maxVisible: 2000,
    });
    const html = render({ head: { summary }, cardTitle: 'h2' });

    expect(html).not.toMatch(/script|onclick|javascript:/i);
  });
});
