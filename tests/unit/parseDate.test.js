import { describe, it, expect } from 'vitest';
import { parseDate } from '../../src/lib/parseDate.js';

// 기준일: 2026-09-18(금)
const BASE = new Date(2026, 8, 18);

describe('parseDate', () => {
  it('내일모레 + 시간을 변환한다', () => {
    expect(parseDate('내일모레 3시', BASE)).toBe('2026-09-20 03:00');
  });

  it('다음 주 요일을 다음 주 기준으로 변환한다', () => {
    expect(parseDate('다음 주 금요일', BASE)).toBe('2026-09-25 00:00');
  });

  it('이번 주 요일은 이미 지난 요일이어도 이번 주 기준으로 변환한다', () => {
    expect(parseDate('이번 주 화요일', BASE)).toBe('2026-09-15 00:00');
  });

  it('오후 시간을 24시간제로 변환한다', () => {
    expect(parseDate('오늘 오후 3시', BASE)).toBe('2026-09-18 15:00');
  });

  it('오전 시간은 그대로 유지한다', () => {
    expect(parseDate('모레 오전 9시', BASE)).toBe('2026-09-20 09:00');
  });

  it('저녁/밤도 오후로 취급한다', () => {
    expect(parseDate('저녁 7시에 봐요', BASE)).toBe('2026-09-18 19:00');
  });

  it('날짜 없이 시간만 있으면 오늘로 간주한다', () => {
    expect(parseDate('15시 30분에 회의', BASE)).toBe('2026-09-18 15:30');
  });

  it('날짜/시간 정보가 없으면 null을 반환한다', () => {
    expect(parseDate('안녕하세요', BASE)).toBeNull();
  });
});
