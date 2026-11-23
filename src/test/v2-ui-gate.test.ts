import { Children, isValidElement, type ReactNode } from 'react';
import { canShowStyleGuide } from '@/app/_v2/ui/gate';
import StyleGuide from '@/app/_v2/ui/StyleGuide';
import ZoneRenderer, { type ZoneRendererProps } from '@/app/_v2/zones/ZoneRenderer';

describe('canShowStyleGuide', () => {
  it('hides the guide from readers in production', () => {
    expect(canShowStyleGuide(false, 'production')).toBe(false);
  });

  it('renders style-guide compositions with a valid page editing scope', async () => {
    const guide = await StyleGuide({});
    const zones: ZoneRendererProps[] = [];
    function visit(node: ReactNode) {
      Children.forEach(node, child => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return;
        if (child.type === ZoneRenderer) zones.push(child.props as ZoneRendererProps);
        visit(child.props.children);
      });
    }
    visit(guide);
    expect(zones.length).toBeGreaterThan(0);
    for (const props of zones) expect(await ZoneRenderer(props)).not.toBeNull();
  });
  it('shows the guide to editors in production', () => {
    expect(canShowStyleGuide(true, 'production')).toBe(true);
  });
  it('shows the guide to anyone in development', () => {
    expect(canShowStyleGuide(false, 'development')).toBe(true);
  });
});
