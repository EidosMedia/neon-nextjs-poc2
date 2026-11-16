import { parseList, parsePairs, readMatch } from '@/app/_v2/brands/moduleData';

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
