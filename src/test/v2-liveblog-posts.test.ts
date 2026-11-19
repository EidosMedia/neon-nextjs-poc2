import {
  formatFeedStamp, formatTimelineDate, initialPostsFromModel, isSameCalendarDate, mergePosts, sortNewestFirst,
  truncateTitle, TIMELINE_VISIBLE_POSTS,
} from '@/app/_v2/liveblog/posts';

describe('initialPostsFromModel', () => {
  it('maps children ids to posts with content and post time', () => {
    const model = {
      children: ['a', 'b'],
      nodes: {
        a: { files: { content: { data: { x: 1 } } }, sys: { postEventTime: '2026-03-03T10:00:00Z' } },
        b: { files: { content: { data: { x: 2 } } }, sys: { postEventTime: '2026-03-03T11:00:00Z' } },
      },
    };
    expect(initialPostsFromModel(model)).toEqual([
      { id: 'a', content: { x: 1 }, publicationTime: '2026-03-03T10:00:00Z' },
      { id: 'b', content: { x: 2 }, publicationTime: '2026-03-03T11:00:00Z' },
    ]);
  });

  it('reads the children from model.data (page response shape) and skips posts not in nodes', () => {
    const model = {
      data: { children: ['a', 'missing'] },
      nodes: { a: { files: { content: { data: { x: 1 } } }, sys: { postEventTime: '2026-03-03T10:00:00Z' } } },
    };
    expect(initialPostsFromModel(model)).toEqual([
      { id: 'a', content: { x: 1 }, publicationTime: '2026-03-03T10:00:00Z' },
    ]);
  });

  it('returns [] without children', () => {
    expect(initialPostsFromModel({})).toEqual([]);
    expect(initialPostsFromModel(undefined)).toEqual([]);
  });
});

describe('mergePosts', () => {
  const known = [{ id: 'a', content: 'old', publicationTime: '2026-03-03T10:00:00Z' }];

  it('adds new posts, the polled copy wins per id and known posts keep their time', () => {
    const polled = [
      { id: 'b', files: { content: { data: 'new' } }, sys: { postEventTime: '2026-03-03T12:00:00Z' } },
      { id: 'a', content: 'fresh', publicationTime: '2026-03-03T10:00:00Z' },
    ];
    expect(mergePosts(known, polled)).toEqual([
      { id: 'b', content: 'new', publicationTime: '2026-03-03T12:00:00Z' },
      { id: 'a', content: 'fresh', publicationTime: '2026-03-03T10:00:00Z' },
    ]);
  });

  it('keeps the known posts when a poll is not an array', () => {
    expect(mergePosts(known, { error: 'x' })).toEqual(known);
  });
});

describe('sortNewestFirst', () => {
  it('orders by publication time descending without mutating', () => {
    const posts = [
      { id: 'a', publicationTime: '2026-03-03T10:00:00Z' },
      { id: 'b', publicationTime: '2026-03-03T12:00:00Z' },
    ];
    expect(sortNewestFirst(posts).map((p) => p.id)).toEqual(['b', 'a']);
    expect(posts[0].id).toBe('a');
  });
});

describe('formatting helpers', () => {
  it('formats the feed stamp with the legacy ordinal suffix', () => {
    expect(formatFeedStamp('2026-03-03T12:05:00Z')).toMatch(/ - March 3rd, 2026$/);
  });
  it('uses 1st/2nd/3rd and th for 11th-13th and the rest', () => {
    const day = (d: string) => formatTimelineDate(`2026-03-${d}T12:00:00Z`);
    expect([day('01'), day('02'), day('03'), day('04')]).toEqual([
      'March 1st, 2026', 'March 2nd, 2026', 'March 3rd, 2026', 'March 4th, 2026',
    ]);
    expect([day('11'), day('12'), day('13'), day('21'), day('22'), day('23')]).toEqual([
      'March 11th, 2026', 'March 12th, 2026', 'March 13th, 2026', 'March 21st, 2026', 'March 22nd, 2026', 'March 23rd, 2026',
    ]);
  });
  it('compares calendar dates', () => {
    expect(isSameCalendarDate('2026-03-03T10:00:00', '2026-03-03T23:00:00')).toBe(true);
    expect(isSameCalendarDate('2026-03-03T10:00:00', '2026-03-04T10:00:00')).toBe(false);
  });
  it('truncates titles to 70 characters with an ellipsis', () => {
    expect(truncateTitle('  short  ')).toBe('short');
    expect(truncateTitle('x'.repeat(80))).toBe(`${'x'.repeat(70)}…`);
    expect(truncateTitle('   ')).toBe('');
  });
  it('shows three timeline posts', () => {
    expect(TIMELINE_VISIBLE_POSTS).toBe(3);
  });
});
