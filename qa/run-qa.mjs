import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { extractAccount } from '../src/lib/extractAccount.js';
import { generateHashtags } from '../src/lib/generateHashtags.js';
import { parseDate } from '../src/lib/parseDate.js';

const BASE_DATE = new Date(2026, 8, 18); // 케이스 생성 시 고정한 기준일과 동일해야 함
const CASES_DIR = new URL('./cases/', import.meta.url);
const REPORT_DIR = new URL('./report/', import.meta.url);

function loadCases(name) {
  const path = new URL(name, CASES_DIR);
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// ---- 계좌번호: 결정적 채점 (생성 에이전트가 spec만 보고 만든 expected와 문자열 비교) ----
function gradeAccount(cases) {
  const failures = [];
  for (const c of cases) {
    const actual = extractAccount(c.input);
    const pass = actual.bank === c.expected.bank && actual.account === c.expected.account;
    if (!pass) failures.push({ id: c.id, input: c.input, expected: c.expected, actual });
  }
  return { total: cases.length, pass: cases.length - failures.length, failures };
}

// ---- 날짜: 독립 오라클로 채점 (lib/parseDate.js 내부 로직을 재사용하지 않음 — 같은 버그 공유 방지) ----
const ISO_WEEKDAY = { 월: 0, 화: 1, 수: 2, 목: 3, 금: 4, 토: 5, 일: 6 };

function pad(n) {
  return String(n).padStart(2, '0');
}
function formatOracle(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function computeExpectedDate(intent, baseDate) {
  if (!intent) return null;
  const hasDay = typeof intent.dayOffset === 'number' || !!intent.week;
  const hasTime = !!intent.time;
  if (!hasDay && !hasTime) return null;

  const result = new Date(baseDate);
  if (typeof intent.dayOffset === 'number') {
    result.setDate(result.getDate() + intent.dayOffset);
  } else if (intent.week) {
    const monday = new Date(result);
    const dow = monday.getDay();
    monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));
    const weeksToAdd = intent.week.when === '다음' ? 1 : 0;
    monday.setDate(monday.getDate() + ISO_WEEKDAY[intent.week.weekday] + weeksToAdd * 7);
    result.setTime(monday.getTime());
  }
  const hour = hasTime ? intent.time.hour : 0;
  const minute = hasTime ? intent.time.minute || 0 : 0;
  result.setHours(hour, minute, 0, 0);
  return formatOracle(result);
}

function gradeDate(cases) {
  const failures = [];
  for (const c of cases) {
    const expected = computeExpectedDate(c.intent, BASE_DATE);
    const actual = parseDate(c.input, BASE_DATE);
    if (actual !== expected) failures.push({ id: c.id, input: c.input, expected, actual });
  }
  return { total: cases.length, pass: cases.length - failures.length, failures };
}

// ---- 해시태그: 정답이 모호해 문자열 비교 불가. 출력만 생성해 별도 채점 에이전트에 넘긴다 ----
function runHashtag(cases) {
  const outputs = cases.map((c) => ({ id: c.id, input: c.input, output: generateHashtags(c.input) }));
  writeFileSync(new URL('hashtag-outputs.json', CASES_DIR), JSON.stringify(outputs, null, 2));

  const scoresPath = new URL('hashtag-scores.json', CASES_DIR);
  if (!existsSync(scoresPath)) {
    return { total: cases.length, pass: null, failures: [], status: 'awaiting-judge' };
  }
  const scores = JSON.parse(readFileSync(scoresPath, 'utf-8')); // [{id, score, reason}]
  const scoreMap = new Map(scores.map((s) => [s.id, s]));
  const failures = [];
  for (const o of outputs) {
    const s = scoreMap.get(o.id);
    if (!s || s.score < 3) failures.push({ id: o.id, input: o.input, output: o.output, score: s?.score ?? null, reason: s?.reason });
  }
  return { total: cases.length, pass: cases.length - failures.length, failures, status: 'judged' };
}

const accountCases = loadCases('account.json');
const dateCases = loadCases('date.json');
const hashtagCases = loadCases('hashtag.json');

const accountResult = gradeAccount(accountCases);
const dateResult = gradeDate(dateCases);
const hashtagResult = runHashtag(hashtagCases);

const gradedTotal = accountResult.total + dateResult.total + (hashtagResult.status === 'judged' ? hashtagResult.total : 0);
const gradedPass = accountResult.pass + dateResult.pass + (hashtagResult.status === 'judged' ? hashtagResult.pass : 0);
const overallRate = gradedTotal ? Math.round((gradedPass / gradedTotal) * 10000) / 100 : null;

const report = {
  date: new Date().toISOString().slice(0, 10),
  baseDate: '2026-09-18',
  categories: {
    account: { ...accountResult, rate: pctOf(accountResult) },
    date: { ...dateResult, rate: pctOf(dateResult) },
    hashtag: hashtagResult.status === 'judged' ? { ...hashtagResult, rate: pctOf(hashtagResult) } : hashtagResult,
  },
  overallRate,
};

function pctOf(r) {
  return r.total ? Math.round((r.pass / r.total) * 10000) / 100 : null;
}

writeFileSync(new URL(`${report.date}.json`, REPORT_DIR), JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
