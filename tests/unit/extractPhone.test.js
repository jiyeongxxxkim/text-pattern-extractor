import { describe, it, expect } from 'vitest';
import { extractPhone } from '../../src/lib/extractPhone.js';

describe('extractPhone', () => {
  it('마침표로 구분된 휴대폰번호를 추출한다 (피드백 #4 재현)', () => {
    expect(extractPhone('연락처는 010.1234.5678 이에요')).toBe('01012345678');
  });

  it('공백으로 구분된 휴대폰번호를 추출한다 (피드백 #4 재현)', () => {
    expect(extractPhone('010 1234 5678 로 연락주세요')).toBe('01012345678');
  });

  it('하이픈으로 구분된 휴대폰번호를 추출한다', () => {
    expect(extractPhone('010-1234-5678')).toBe('01012345678');
  });

  it('서울 지역번호를 추출한다', () => {
    expect(extractPhone('사무실 02-1234-5678 로 전화주세요')).toBe('0212345678');
  });

  it('타 지역 지역번호(3자리)를 추출한다', () => {
    expect(extractPhone('031-123-4567')).toBe('0311234567');
  });

  it('인터넷전화(070)를 추출한다', () => {
    expect(extractPhone('070-1234-5678')).toBe('07012345678');
  });

  it('계좌번호(12자리 이상)는 전화번호로 오인하지 않는다', () => {
    expect(extractPhone('국민은행 110-234-567890 로 보내주세요')).toBeNull();
  });

  it('전화번호가 없으면 null을 반환한다', () => {
    expect(extractPhone('안녕하세요')).toBeNull();
  });

  it('계좌번호와 전화번호가 섞인 문장에서 전화번호만 정확히 뽑는다', () => {
    expect(
      extractPhone('국민은행 110-234-567890 이고 연락처는 010-9876-5432 입니다')
    ).toBe('01098765432');
  });
});
