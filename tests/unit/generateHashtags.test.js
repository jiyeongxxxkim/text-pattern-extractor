import { describe, it, expect } from 'vitest';
import { generateHashtags } from '../../src/lib/generateHashtags.js';

describe('generateHashtags', () => {
  it('조사를 제거하고 빈도순으로 해시태그를 반환한다', () => {
    expect(
      generateHashtags('사과는 맛있다 사과가 빨갛다 사과를 먹었다 바나나도 있다', 2)
    ).toEqual(['#사과', '#바나나']);
  });

  it('여러 조사(으로/에서/이)를 동일 명사로 묶는다', () => {
    expect(generateHashtags('집으로 갔다 집에서 잤다 집이 좋다', 1)).toEqual(['#집']);
  });

  it('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(generateHashtags('')).toEqual([]);
    expect(generateHashtags('   ')).toEqual([]);
  });

  it('말줄임표/이모티콘 등 후행 노이즈를 제거한다', () => {
    expect(generateHashtags('피자ㅋㅋㅋ 콜라 피자!! 최고다~', 2)).toEqual(['#피자', '#콜라']);
  });

  it('topN보다 고유 단어 수가 적으면 있는 만큼만 반환한다', () => {
    expect(generateHashtags('커피 마셨다 콜라 마셨다 커피 좋다')).toEqual(['#커피', '#콜라']);
  });

  it('동사/형용사 활용형은 명사가 아니므로 제외한다', () => {
    expect(generateHashtags('공부 열심히 했다 공부 진짜 재밌다', 2)).toEqual([
      '#공부',
      '#열심히',
    ]);
  });

  it('의미 없는 의존명사/대명사/부사(이, 중, 진짜 등)는 제외한다', () => {
    expect(
      generateHashtags('이 영화 진짜 좋아요 이 배우 연기 최고')
    ).toEqual(['#영화', '#배우', '#연기', '#최고']);
  });

  it('어미 길이와 정확히 같은 단어도 활용형으로 인식한다', () => {
    expect(generateHashtags('다이어트 그만할래 다이어트 스트레스 받아')).toEqual([
      '#다이어트',
      '#스트레스',
      '#받아',
    ]);
  });

  it('긴 조사(이라도/이라서)도 제거한다', () => {
    expect(generateHashtags('야근수당이라도 주세요 야근 진짜 싫다', 2)).toEqual([
      '#야근수당',
      '#야근',
    ]);
  });
});
