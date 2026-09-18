const BANK_ALIASES = {
  국민은행: ['국민은행', '국민', 'kb국민', 'kb'],
  신한은행: ['신한은행', '신한'],
  우리은행: ['우리은행', '우리'],
  하나은행: ['하나은행', '하나'],
  기업은행: ['기업은행', 'ibk기업', 'ibk', '기업'],
  농협은행: ['농협은행', 'nh농협', 'nh', '농협'],
  카카오뱅크: ['카카오뱅크', '카카오'],
  토스뱅크: ['토스뱅크', '토스'],
  케이뱅크: ['케이뱅크', 'k뱅크'],
  새마을금고: ['새마을금고', '새마을'],
  우체국: ['우체국', '우체국은행'],
  수협은행: ['수협은행', '수협'],
  신협: ['신협'],
  sc제일은행: ['sc제일은행', 'sc제일', '제일은행'],
  씨티은행: ['씨티은행', '씨티'],
};

// 별칭을 길이 내림차순으로 정렬 — 짧은 별칭("우리")이 긴 별칭("우리은행")보다 먼저 매칭되는 걸 방지
const ALIAS_TABLE = Object.entries(BANK_ALIASES)
  .flatMap(([canonical, aliases]) => aliases.map((alias) => ({ alias, canonical })))
  .sort((a, b) => b.alias.length - a.alias.length);

// ponytail: 자모 분리 오타(예: "ㄱㅜㄱㅁㅣㄴ") 재조합은 미지원.
// M4 AI QA에서 실패율이 유의미하게 나오면 그때 자모 재조합 로직을 추가한다.
function extractBank(text) {
  const compact = text.toLowerCase().replace(/\s+/g, '');
  const found = ALIAS_TABLE.find(({ alias }) => compact.includes(alias));
  return found ? found.canonical : null;
}

function extractAccountNumber(text) {
  const candidates = text.match(/\d[\d\-. ]{8,24}\d/g) || [];
  for (const candidate of candidates) {
    const digits = candidate.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('010')) continue; // 휴대폰번호 제외
    if (digits.length >= 10 && digits.length <= 16) return digits;
  }
  return null;
}

export function extractAccount(text) {
  return {
    bank: extractBank(text),
    account: extractAccountNumber(text),
  };
}
