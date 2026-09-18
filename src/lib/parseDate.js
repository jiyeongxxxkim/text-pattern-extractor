const DAY_OFFSETS = { 그제: -2, 어제: -1, 오늘: 0, 내일: 1, 모레: 2, 내일모레: 2, 글피: 3 };
const DAY_KEYS = Object.keys(DAY_OFFSETS).sort((a, b) => b.length - a.length);

const ISO_WEEKDAY = { 월: 0, 화: 1, 수: 2, 목: 3, 금: 4, 토: 5, 일: 6 };
const PM_MARKERS = ['오후', '저녁', '밤'];

function mondayOf(date) {
  const d = new Date(date);
  const dow = d.getDay(); // 0=일 ... 6=토
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

// ponytail: "금요일에 봐요"처럼 이번/다음 없이 단독으로 쓰인 요일은 미지원.
// M4 AI QA 정답률에서 필요성이 확인되면 추가한다.
const WEEKS_AHEAD = { 다다음: 2, 다음: 1, 이번: 0 };

function resolveDate(text, baseDate) {
  // "다다음"을 "다음"보다 먼저 검사해야 함 — 정규식 자체는 위치상 문제 없지만 의도를 명확히 함
  const weekMatch = text.match(/(다다음|다음|이번)\s*주\s*([일월화수목금토])(?:요일)?/);
  if (weekMatch) {
    const [, when, wd] = weekMatch;
    const monday = mondayOf(baseDate);
    monday.setDate(monday.getDate() + ISO_WEEKDAY[wd] + WEEKS_AHEAD[when] * 7);
    return monday;
  }

  const foundKey = DAY_KEYS.find((key) => text.includes(key));
  if (foundKey) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + DAY_OFFSETS[foundKey]);
    return d;
  }

  return null;
}

function resolveTime(text) {
  const match = text.match(/(오전|오후|저녁|밤)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분)?/);
  if (!match) return null;

  const [, marker, hourStr, minuteStr] = match;
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;

  if (PM_MARKERS.includes(marker) && hour < 12) hour += 12;
  if (marker === '오전' && hour === 12) hour = 0;

  return { hour, minute };
}

function format(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDate(text, baseDate = new Date()) {
  const datePart = resolveDate(text, baseDate);
  const timePart = resolveTime(text);
  if (!datePart && !timePart) return null;

  const result = datePart ? new Date(datePart) : new Date(baseDate);
  if (timePart) {
    result.setHours(timePart.hour, timePart.minute, 0, 0);
  } else {
    result.setHours(0, 0, 0, 0);
  }

  return format(result);
}
