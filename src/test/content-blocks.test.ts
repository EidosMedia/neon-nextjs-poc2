import { getBlockLinkedObjects, getContentBlockLinks, toBlockJsonPath } from '@/lib/contentBlocks';

const pageWith = (blocklink: unknown) =>
  ({ model: { data: { links: { pagelink: {}, blocklink } } } }) as never;

describe('getContentBlockLinks', () => {
  test('lists the blocks of each zone with their target and url', () => {
    const links = getContentBlockLinks(
      pageWith({
        includes: [
          {
            targetId: '0800-221790aaa1ca-b9a9878a89ba-1024',
            url: '/sport/0800-221790aaa1ca-b9a9878a89ba-1024/index.html',
            metadata: { type: 'contentblock', metadataType: 'blocklink' },
            key: 1537228672809128960,
          },
        ],
      }),
    );

    expect(links).toEqual([
      {
        zone: 'includes',
        targetId: '0800-221790aaa1ca-b9a9878a89ba-1024',
        url: '/sport/0800-221790aaa1ca-b9a9878a89ba-1024/index.html',
        key: 1537228672809128960,
      },
    ]);
  });

  test('skips entries that have no target or no url', () => {
    const links = getContentBlockLinks(
      pageWith({ includes: [{ targetId: 'a' }, { url: '/x/index.html' }, { targetId: 'b', url: '/b/index.html' }] }),
    );

    expect(links.map(link => link.targetId)).toEqual(['b']);
  });

  test('returns an empty list when the page has no blocklink', () => {
    expect(getContentBlockLinks(pageWith(undefined))).toEqual([]);
  });
});

describe('toBlockJsonPath', () => {
  test('replaces index.html with index.json', () => {
    expect(toBlockJsonPath('/sport/0800-1024/index.html')).toBe('/sport/0800-1024/index.json');
  });
});

describe('getBlockLinkedObjects', () => {
  test('resolves the main zone items with their picture and link metadata', () => {
    const items = getBlockLinkedObjects({
      data: { links: { pagelink: { main: [{ targetId: 'a', metadata: { metadataType: 'pagelink' } }] } } },
      nodes: {
        a: { id: 'a', title: 'Article', links: { system: { mainPicture: [{ targetId: 'p' }] } } },
        p: { id: 'p', resourceUrl: '/resources/p.jpg' },
      },
    });

    expect(items).toEqual([
      {
        id: 'a',
        title: 'Article',
        links: { system: { mainPicture: [{ targetId: 'p' }] } },
        mainPicture: '/resources/p.jpg',
        linkMetadata: { metadataType: 'pagelink' },
      },
    ]);
  });
});
