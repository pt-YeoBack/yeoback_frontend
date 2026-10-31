/**
 * 테스트용 인증 서비스 (프론트엔드 전용)
 * ------------------------------------------------------------
 * 이 프로젝트에는 실제 서버 · 이메일 발송 · 문자 발송 기능이 연결되어 있지 않습니다.
 * 아래 함수들은 브라우저 안에서만 동작하는 "테스트 모드" 구현이며,
 * 인증코드는 실제로 발송되지 않고 화면의 테스트 안내 영역에만 표시됩니다.
 *
 * 실제 백엔드를 연결할 때는 이 파일의 함수 시그니처를 유지한 채
 * 내부 구현만 API 호출(fetch 등)로 교체하면 화면 코드를 고치지 않아도 됩니다.
 */
import { ContactMethod, normalizeContact } from './validation';

export const IS_TEST_MODE = true;

export const CODE_LENGTH = 4;
export const CODE_TTL_MS = 5 * 60 * 1000; // 인증코드 유효시간 5분
export const RESEND_COOLDOWN_MS = 60 * 1000; // 재전송 대기 60초
export const MAX_ATTEMPTS = 5;

export interface TestUser {
  name: string;
  email?: string; // 소문자 정규화
  phone?: string; // 숫자만
  password: string; // 테스트 모드라 평문 저장 — 실제 서비스에서는 절대 이렇게 저장하지 않습니다.
  marketing?: boolean;
}

export type CodePurpose = 'signup' | 'reset';

interface PendingCode {
  code: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

/** 처음부터 로그인해 볼 수 있도록 넣어 둔 테스트 계정 */
export const DEMO_ACCOUNT = {
  name: '김서연',
  email: 'seoyeon.kim@email.com',
  phone: '010-1234-5678',
  password: 'Yeobaek!2026',
};

const USERS_KEY = 'yeobaek.test.users';
const SESSION_KEY = 'yeobaek.test.session';

const memory: { users: TestUser[] | null; session: string | null } = { users: null, session: null };
const pending = new Map<string, PendingCode>();

function seedUsers(): TestUser[] {
  return [
    {
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      phone: normalizeContact('phone', DEMO_ACCOUNT.phone),
      password: DEMO_ACCOUNT.password,
    },
  ];
}

function readUsers(): TestUser[] {
  if (memory.users) return memory.users;
  let users: TestUser[] | null = null;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (raw) users = JSON.parse(raw) as TestUser[];
  } catch {
    users = null;
  }
  memory.users = users && Array.isArray(users) ? users : seedUsers();
  return memory.users;
}

function writeUsers(users: TestUser[]) {
  memory.users = users;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* 저장소를 쓸 수 없는 환경에서는 메모리에만 보관 */
  }
}

function findUser(method: ContactMethod, value: string): TestUser | undefined {
  const key = normalizeContact(method, value);
  return readUsers().find((u) => (method === 'email' ? u.email === key : u.phone === key));
}

function wait(ms = 550) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pendingKey(purpose: CodePurpose, method: ContactMethod, value: string) {
  return `${purpose}:${method}:${normalizeContact(method, value)}`;
}

function generateCode(): string {
  // 헷갈리기 쉬운 문자(0, O, 1, I)는 제외
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ---------------------------------------------------------------------------
// 계정
// ---------------------------------------------------------------------------

export function accountExists(method: ContactMethod, value: string): boolean {
  return Boolean(findUser(method, value));
}

export async function registerAccount(input: {
  name: string;
  method: ContactMethod;
  contact: string;
  password: string;
  marketing: boolean;
}): Promise<{ ok: true; user: TestUser } | { ok: false; reason: 'duplicate' }> {
  await wait(300);
  if (findUser(input.method, input.contact)) return { ok: false, reason: 'duplicate' };
  const user: TestUser = {
    name: input.name.trim(),
    password: input.password,
    marketing: input.marketing,
    ...(input.method === 'email'
      ? { email: normalizeContact('email', input.contact) }
      : { phone: normalizeContact('phone', input.contact) }),
  };
  writeUsers([...readUsers(), user]);
  return { ok: true, user };
}

export type LoginResult = { ok: true; user: TestUser } | { ok: false; reason: 'invalid' };

export async function login(method: ContactMethod, contact: string, password: string): Promise<LoginResult> {
  await wait();
  const user = findUser(method, contact);
  // 계정 존재 여부가 드러나지 않도록 같은 안내를 사용합니다.
  if (!user || user.password !== password) return { ok: false, reason: 'invalid' };
  setSession(user);
  return { ok: true, user };
}

export async function resetPassword(
  method: ContactMethod,
  contact: string,
  newPassword: string,
): Promise<{ ok: true; user: TestUser } | { ok: false; reason: 'not_found' | 'same_as_before' }> {
  await wait();
  const user = findUser(method, contact);
  if (!user) return { ok: false, reason: 'not_found' };
  if (user.password === newPassword) return { ok: false, reason: 'same_as_before' };
  const updated = { ...user, password: newPassword };
  writeUsers(readUsers().map((u) => (u === user ? updated : u)));
  return { ok: true, user: updated };
}

// ---------------------------------------------------------------------------
// 세션
// ---------------------------------------------------------------------------

export function setSession(user: TestUser | null) {
  const id = user ? user.email ?? user.phone ?? null : null;
  memory.session = id;
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

export function getSessionUser(): TestUser | null {
  let id = memory.session;
  if (!id) {
    try {
      id = window.localStorage.getItem(SESSION_KEY);
    } catch {
      id = null;
    }
  }
  if (!id) return null;
  return readUsers().find((u) => u.email === id || u.phone === id) ?? null;
}

export function resetTestData() {
  pending.clear();
  memory.users = null;
  memory.session = null;
  try {
    window.localStorage.removeItem(USERS_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------------
// 인증코드 (테스트용: 실제로 발송되지 않음)
// ---------------------------------------------------------------------------

export interface SentCode {
  /** 테스트 모드에서만 화면에 보여 주는 코드. 실제 서비스에서는 응답에 포함되면 안 됩니다. */
  testCode: string;
  expiresAt: number;
  resendAvailableAt: number;
}

export async function sendCode(purpose: CodePurpose, method: ContactMethod, contact: string): Promise<SentCode> {
  await wait(350);
  const now = Date.now();
  const code = generateCode();
  pending.set(pendingKey(purpose, method, contact), {
    code,
    sentAt: now,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
  });
  return { testCode: code, expiresAt: now + CODE_TTL_MS, resendAvailableAt: now + RESEND_COOLDOWN_MS };
}

/** 현재 유효한 코드 정보를 다시 읽는다 (화면 이동 후 타이머 복원용). */
export function peekCode(purpose: CodePurpose, method: ContactMethod, contact: string): SentCode | null {
  const p = pending.get(pendingKey(purpose, method, contact));
  if (!p) return null;
  return { testCode: p.code, expiresAt: p.expiresAt, resendAvailableAt: p.sentAt + RESEND_COOLDOWN_MS };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'mismatch'; attemptsLeft: number }
  | { ok: false; reason: 'expired' | 'too_many' | 'no_code' };

export async function verifyCode(
  purpose: CodePurpose,
  method: ContactMethod,
  contact: string,
  input: string,
): Promise<VerifyResult> {
  await wait(450);
  const key = pendingKey(purpose, method, contact);
  const p = pending.get(key);
  if (!p) return { ok: false, reason: 'no_code' };
  if (Date.now() > p.expiresAt) return { ok: false, reason: 'expired' };
  if (p.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many' };
  if (p.code !== input.toUpperCase()) {
    p.attempts += 1;
    const attemptsLeft = MAX_ATTEMPTS - p.attempts;
    if (attemptsLeft <= 0) return { ok: false, reason: 'too_many' };
    return { ok: false, reason: 'mismatch', attemptsLeft };
  }
  pending.delete(key);
  return { ok: true };
}
