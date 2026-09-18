import { isPhoneNumber } from './phoneRules.js';

export function extractPhone(text) {
  const candidates = text.match(/\d[\d\-. ]{7,13}\d/g) || [];
  for (const candidate of candidates) {
    const digits = candidate.replace(/\D/g, '');
    if (isPhoneNumber(digits)) return digits;
  }
  return null;
}
