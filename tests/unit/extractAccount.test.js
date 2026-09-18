import { describe, it, expect } from 'vitest';
import { extractAccount } from '../../src/lib/extractAccount.js';

describe('extractAccount', () => {
  it('은행명과 계좌번호를 정상 추출한다', () => {
    expect(extractAccount('국민은행 123-456-789012 로 보내주세요')).toEqual({
      bank: '국민은행',
      account: '123456789012',
    });
  });

  it('은행명 줄임말을 인식한다', () => {
    expect(extractAccount('신한 110123456789 입니다')).toEqual({
      bank: '신한은행',
      account: '110123456789',
    });
  });

  it('띄어쓰기가 엉망인 입력을 처리한다', () => {
    expect(extractAccount('우 리 은행 1002 - 123 - 456789')).toEqual({
      bank: '우리은행',
      account: '1002123456789',
    });
  });

  it('영문 약칭 은행명을 인식한다', () => {
    expect(extractAccount('kb 123456789012 계좌')).toEqual({
      bank: '국민은행',
      account: '123456789012',
    });
  });

  it('계좌번호가 없으면 account는 null', () => {
    expect(extractAccount('국민은행으로 연락주세요')).toEqual({
      bank: '국민은행',
      account: null,
    });
  });

  it('은행명이 없으면 bank는 null', () => {
    expect(extractAccount('123-456-789012 로 보내주세요')).toEqual({
      bank: null,
      account: '123456789012',
    });
  });

  it('휴대폰 번호는 계좌번호로 오인하지 않는다', () => {
    expect(extractAccount('연락처 010-1234-5678 입니다')).toEqual({
      bank: null,
      account: null,
    });
  });

  it('숫자가 너무 짧으면 계좌번호로 보지 않는다', () => {
    expect(extractAccount('123-456 은 코드입니다')).toEqual({
      bank: null,
      account: null,
    });
  });

  it('짧은 별칭("우리")이 긴 별칭("우리은행")을 침범하지 않는다', () => {
    expect(extractAccount('우리은행 123456789012')).toEqual({
      bank: '우리은행',
      account: '123456789012',
    });
  });
});
