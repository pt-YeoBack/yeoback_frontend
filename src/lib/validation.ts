export type ContactMethod = 'email' | 'phone';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** 한국 휴대폰 번호: 010/011/016/017/018/019 + 7~8자리 */
export function isValidPhone(value: string): boolean {
  return /^01[016789]\d{7,8}$/.test(phoneDigits(value));
}

/** 입력 중인 숫자를 010-1234-5678 형태로 맞춰 준다. */
export function formatPhone(value: string): string {
  const d = phoneDigits(value).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function normalizeContact(method: ContactMethod, value: string): string {
  return method === 'email' ? value.trim().toLowerCase() : phoneDigits(value);
}

export function validateContact(method: ContactMethod, value: string): string | null {
  if (!value.trim()) {
    return method === 'email' ? '이메일을 입력해 주세요.' : '휴대폰 번호를 입력해 주세요.';
  }
  if (method === 'email' && !isValidEmail(value)) {
    return '이메일 형식이 올바르지 않아요. 예) name@email.com';
  }
  if (method === 'phone' && !isValidPhone(value)) {
    return '휴대폰 번호 형식이 올바르지 않아요. 예) 010-1234-5678';
  }
  return null;
}

export interface PasswordChecks {
  length: boolean;
  letter: boolean;
  number: boolean;
  special: boolean;
}

export function checkPassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    letter: /[A-Za-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9\s]/.test(pw),
  };
}

export function validatePassword(pw: string): string | null {
  if (!pw) return '비밀번호를 입력해 주세요.';
  const c = checkPassword(pw);
  if (!(c.length && c.letter && c.number && c.special)) {
    return '영문·숫자·특수문자를 모두 포함해 8자 이상 입력해 주세요.';
  }
  return null;
}

export function validateConfirm(pw: string, confirm: string): string | null {
  if (!confirm) return '비밀번호를 한 번 더 입력해 주세요.';
  if (pw !== confirm) return '비밀번호가 일치하지 않아요.';
  return null;
}

export function validateName(name: string): string | null {
  const v = name.trim();
  if (!v) return '이름을 입력해 주세요.';
  if (v.length > 20) return '이름은 20자 이내로 입력해 주세요.';
  return null;
}

export function displayContact(method: ContactMethod, value: string): string {
  return method === 'phone' ? formatPhone(value) : value.trim();
}

export function methodLabel(method: ContactMethod): string {
  return method === 'email' ? '이메일' : '휴대폰 번호';
}
