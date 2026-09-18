// 한국 전화번호 국번은 법정 고정 목록 — extractAccount(전화번호 오인 방지)와
// extractPhone(전화번호 추출) 양쪽에서 공유한다. 한쪽만 고치다 놓치는 걸 방지하기 위해
// 판별 로직을 한 곳에 둔다.
export const PHONE_PREFIXES = [
  '010', '011', '016', '017', '018', '019', '070',
  '02',
  '031', '032', '033', '041', '042', '043', '044',
  '051', '052', '053', '054', '055', '061', '062', '063', '064',
];

export function isPhoneNumber(digits) {
  const prefix = PHONE_PREFIXES.find((p) => digits.startsWith(p));
  if (!prefix) return false;
  return prefix === '02' ? digits.length === 9 || digits.length === 10 : digits.length === 10 || digits.length === 11;
}
