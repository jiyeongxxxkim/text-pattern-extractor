// 길이 내림차순 — 짧은 조사("은")가 긴 조사("으로써")보다 먼저 매칭되는 걸 방지
const PARTICLES = [
  '으로써', '이라도', '이라서', '에서', '부터', '까지', '한테', '이랑', '이나', '이라',
  '으로', '에게', '와', '과', '은', '는', '이', '가',
  '을', '를', '의', '에', '도', '만',
];

// 그 자체로 의미 없는 의존명사/대명사/부사 — 조사 제거 후에도 문장의 핵심어가 아니므로 통째로 버림
const STOPWORDS = new Set([
  '이', '그', '저', '것', '수', '중', '후', '전', '때', '좀', '더', '등', '걸', '이거',
  '진짜', '너무', '정말', '드디어', '또', '이제', '역시', '왜', '벌써', '완전', '그냥',
  '아까', '방금', '계속', '자꾸', '갑자기', '다', '나',
]);

// ponytail: 형태소 분석기 없이 흔한 종결/연결 어미로 "이건 명사가 아니라 용언(동사·형용사)이다"를
// 판별하는 근사치. "필요"(명사)가 "요"로 끝나는 경우처럼 드물게 명사를 오배제할 위험이 있음 —
// M4 QA 정답률이 이 트레이드오프로도 부족하면 형태소 분석기 도입을 검토한다(docs/00-decision-log.md D-010).
const PREDICATE_ENDINGS = [
  '그만할래', '고싶다', '습니다', '했어요', '았어요', '었어요',
  '는데', '지만', '니까', '길래', '겠다', '였다', '았다', '었다', '한다', '인데', '이야', '해요', '싶다',
  '을게', 'ㄹ게', '야지',
  '다', '요',
];

const TRAILING_NOISE = /[!?.,~^ㅋㅎㅠㅜ]+$/;

function stripParticle(token) {
  const particle = PARTICLES.find((p) => token.length > p.length && token.endsWith(p));
  return particle ? token.slice(0, -particle.length) : token;
}

function looksLikePredicate(word) {
  // "그만할래"처럼 단어 전체가 어미 패턴과 정확히 같은 길이인 경우도 잡아야 하므로 >= 사용
  if (PREDICATE_ENDINGS.some((e) => word.length >= e.length && word.endsWith(e))) return true;
  return word.length >= 2 && word.endsWith('하'); // "공부하는/공부하고" 등에서 조사 제거 후 남는 용언 어간 조각
}

export function generateHashtags(text, topN = 5) {
  const counts = new Map();

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const cleaned = raw.replace(TRAILING_NOISE, '');
    if (!cleaned || STOPWORDS.has(cleaned)) continue;

    const word = stripParticle(cleaned);
    if (!word || STOPWORDS.has(word) || looksLikePredicate(word)) continue;

    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => `#${word}`);
}
