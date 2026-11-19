import { parseList, parsePairs, readMatch, safeHref } from '@/app/_v2/brands/moduleData';

describe('module data parsing', () => {
  it('parseList splits pipes and drops blanks', () => {
    expect(parseList('a| b ||c')).toEqual(['a', 'b', 'c']);
    expect(parseList(undefined)).toEqual([]);
  });
  it('parsePairs reads strings and objects, skipping malformed entries', () => {
    expect(parsePairs('A: 1|B: 2:3|bad')).toEqual([{ label: 'A', value: '1' }, { label: 'B', value: '2:3' }]);
    expect(parsePairs([{ label: 'X', value: 'y' }, { label: 'Z' }])).toEqual([{ label: 'X', value: 'y' }]);
  });
  it('readMatch needs two teams and never invents a score', () => {
    expect(readMatch({ teams: 'A' })).toBeUndefined();
    expect(readMatch({ teams: 'A|B' })).toEqual({ home: 'A', away: 'B', score: undefined, status: undefined, competition: undefined });
  });
});

describe('safeHref', () => {
  it('rejects unsafe values and keeps same-site and https links', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined();
    expect(safeHref('//evil.example')).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
    expect(safeHref('/sport/')).toBe('/sport/');
    expect(safeHref('https://example.com/x')).toBe('https://example.com/x');
  });
});
