import { describe, it, expect } from 'vitest';
import { generateHashtags } from '../../src/lib/generateHashtags.js';

describe('generateHashtags', () => {
  it('조사를 제거하고 빈도순으로 해시태그를 반환한다', () => {
    expect(generateHashtags('사과는 맛있다 사과가 빨갛다 사과를 먹었다', 2)).toEqual([
      '#사과',
      '#맛있다',
    ]);
  });

  it('여러 조사(으로/에서/이)를 동일 명사로 묶는다', () => {
    expect(generateHashtags('집으로 갔다 집에서 잤다 집이 좋다', 1)).toEqual(['#집']);
  });

  it('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(generateHashtags('')).toEqual([]);
    expect(generateHashtags('   ')).toEqual([]);
  });

  it('말줄임표/이모티콘 등 후행 노이즈를 제거한다', () => {
    expect(generateHashtags('좋다ㅋㅋㅋ 정말 좋다!! 최고다~', 2)).toEqual(['#좋다', '#정말']);
  });

  it('topN보다 고유 단어 수가 적으면 있는 만큼만 반환한다', () => {
    expect(generateHashtags('커피 마셨다 콜라 마셨다 커피 좋다')).toEqual([
      '#커피',
      '#마셨다',
      '#콜라',
      '#좋다',
    ]);
  });
});
