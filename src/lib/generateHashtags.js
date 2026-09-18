// 길이 내림차순 — 짧은 조사("은")가 긴 조사("으로써")보다 먼저 매칭되는 걸 방지
const PARTICLES = [
  '으로써', '에서', '부터', '까지', '한테', '이랑', '이나',
  '으로', '에게', '와', '과', '은', '는', '이', '가',
  '을', '를', '의', '에', '도', '만',
];

const TRAILING_NOISE = /[!?.,~^ㅋㅎㅠㅜ]+$/;

// ponytail: 형태소 분석기 없이 접미사 목록으로 조사를 근사 제거함.
// "하나"(나 제거 시 "하"), "포도"(도 제거 시 "포") 같은 오탈락 위험이 있어
// 충돌 빈도가 높은 단일 글자 조사(나, 랑)는 목록에서 제외했다.
// M4 AI QA 정답률이 낮으면 예외 사전을 추가한다.
function stripParticle(token) {
  const particle = PARTICLES.find((p) => token.length > p.length && token.endsWith(p));
  return particle ? token.slice(0, -particle.length) : token;
}

export function generateHashtags(text, topN = 5) {
  const counts = new Map();

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const word = stripParticle(raw.replace(TRAILING_NOISE, ''));
    if (!word) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => `#${word}`);
}
