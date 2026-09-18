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

function editDistanceAtMost1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length] <= 1;
}

// 한글 별칭(2자 이상)만 오타 허용 — 영문 약칭은 2~3자라 편집거리 1도 오탐이 잦아 제외
const FUZZY_CANDIDATES = ALIAS_TABLE.filter(({ alias }) => /^[가-힣]{2,}$/.test(alias));

// ponytail: 자모 분리 오타(예: "ㄱㅜㄱㅁㅣㄴ") 재조합은 미지원.
// M4 AI QA에서 실패율이 유의미하게 나오면 그때 자모 재조합 로직을 추가한다.
//
// 오타 매칭은 압축된 문자열 전체가 아니라 "토큰 단위"로만 수행한다.
// 최초 구현은 압축 문자열에서 슬라이딩 윈도우로 부분 문자열을 비교했는데,
// "여기로"의 "기로"가 "기업"과 편집거리 1로 오탐되는 등 정상 문장을 다수
// 오염시켰다(M4 QA 1차 실행에서 발견, docs/00-decision-log.md D-008).
// 토큰(공백 단위) 전체를 비교 대상으로 좁혀 오탐을 제거했다.
function extractBank(text) {
  const compact = text.toLowerCase().replace(/\s+/g, '');
  const exact = ALIAS_TABLE.find(({ alias }) => compact.includes(alias));
  if (exact) return exact.canonical;

  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  for (const raw of tokens) {
    const token = raw.replace(/(은행|뱅크)$/, '');
    for (const { alias, canonical } of FUZZY_CANDIDATES) {
      if (Math.abs(token.length - alias.length) > 1) continue;
      if (editDistanceAtMost1(token, alias)) return canonical;
    }
  }
  return null;
}

// ponytail: "예전 계좌 X 말고 새 계좌 Y로" 처럼 부정 표현으로 앞 숫자를 무효화하는
// 문장은 미지원 — 첫 번째 후보를 그대로 반환한다. 부정어 주변 문맥 판단은 정규식
// 범위를 벗어나는 문제라 M4 QA 실패 케이스로 기록만 하고 넘어간다(docs/00-decision-log.md D-008).
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
