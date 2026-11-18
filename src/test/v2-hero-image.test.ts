import { heroImage } from '@/app/_v2/leaves/heroImage';
import type { ArticleModel } from '@/types/models';

const doc = (images: Record<string, string>[]) => ({
  nodeType: 'doc',
  elements: [{ nodeType: 'story', elements: [{ nodeType: 'web-image-group', elements: images.map(attributes => ({ nodeType: 'image', attributes, elements: [] })) }] }],
});
const art = (extra: object) => ({ files: { content: { data: null } }, ...extra }) as unknown as ArticleModel;

describe('heroImage', () => {
  it('prefers the main picture crop', () => {
    const a = art({ links: { system: { mainPicture: [{ dynamicCropsResourceUrls: { Wide_large: '/m.jpg' } }] } } });
    expect(heroImage(a, 'Wide_large')).toBe('/m.jpg');
  });

  it('falls back to the Wide image of the content image group when links are missing', () => {
    const a = art({ files: { content: { data: doc([{ softCrop: 'Square', src: '/sq.jpg' }, { softCrop: 'Wide', src: '/wide.jpg' }]) } } });
    expect(heroImage(a, 'Wide_large')).toBe('/wide.jpg');
  });

  it('returns undefined when the image group has no picture', () => {
    const a = art({ files: { content: { data: doc([{ softCrop: 'Wide', id: 'q' }]) } } });
    expect(heroImage(a, 'Wide_large')).toBeUndefined();
  });
});
