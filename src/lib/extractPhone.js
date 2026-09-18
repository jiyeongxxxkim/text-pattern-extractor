// 한국 전화번호 국번은 법정 고정 목록이라(은행명과 달리 오탈자/줄임말 걱정 없음)
// prefix + 총 자릿수만으로 계좌번호 등 다른 숫자와 신뢰성 있게 구분 가능.
// 참고: 010/011/016~019(휴대폰), 070(인터넷전화), 02(서울), 03X~06X(그 외 지역번호)
const PHONE_PREFIXES = [
  '010', '011', '016', '017', '018', '019', '070',
  '02',
  '031', '032', '033', '041', '042', '043', '044',
  '051', '052', '053', '054', '055', '061', '062', '063', '064',
];

function isValidPhoneLength(prefix, length) {
  return prefix === '02' ? length === 9 || length === 10 : length === 10 || length === 11;
}

export function extractPhone(text) {
  const candidates = text.match(/\d[\d\-. ]{7,13}\d/g) || [];
  for (const candidate of candidates) {
    const digits = candidate.replace(/\D/g, '');
    const prefix = PHONE_PREFIXES.find((p) => digits.startsWith(p));
    if (prefix && isValidPhoneLength(prefix, digits.length)) return digits;
  }
  return null;
}
