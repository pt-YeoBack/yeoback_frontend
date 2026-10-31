import { ClipboardEvent, KeyboardEvent, ReactNode, useRef } from 'react';
import { useAppState } from '../lib/appState';
import { circle, circleCheck, chevronRight, google, kakao, naver } from './icons';

// ---------------------------------------------------------------------------
// 소셜 로그인 — Figma 디자인 유지, OAuth는 아직 연결되지 않은 상태로 처리
// ---------------------------------------------------------------------------

const PROVIDERS = [
  { key: 'google', label: '구글', name: 'Google', icon: google, w: 24, h: 24 },
  { key: 'naver', label: '네이버', name: 'NAVER', icon: naver, w: 24, h: 24 },
  { key: 'kakao', label: '카카오', name: 'Kakao', icon: kakao, w: 28, h: 24 },
] as const;

export function SocialLogin({ caption, mode }: { caption: string; mode: 'signup' | 'login' }) {
  const { showToast } = useAppState();
  return (
    <section className="social" aria-label={caption}>
      <p className="social-caption">{caption}</p>
      <div className="social-row">
        {PROVIDERS.map((p) => (
          <div className="social-provider" key={p.key}>
            <button
              type="button"
              className={`social-button social-${p.key}`}
              aria-label={`${p.name}로 ${mode === 'signup' ? '시작하기' : '로그인'} (연결 필요)`}
              onClick={() =>
                showToast(`${p.name} 로그인은 아직 연결되지 않았어요. OAuth 설정이 필요해요.`, 'info')
              }
            >
              <img src={p.icon} alt="" width={p.w} height={p.h} />
            </button>
            <span className="social-label" aria-hidden="true">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 안내 카드 (Figma "Guidance")
// ---------------------------------------------------------------------------

export function GuidanceCard({
  icon,
  title,
  children,
  tone = 'neutral',
}: {
  icon: string | ReactNode;
  title: string;
  children: ReactNode;
  tone?: 'neutral' | 'error' | 'success';
}) {
  return (
    <section className={`guidance guidance-${tone}`}>
      <div className="guidance-title">
        {typeof icon === 'string' ? <img src={icon} alt="" width={19} height={19} /> : icon}
        <h2>{title}</h2>
      </div>
      <div className="guidance-body">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 테스트 모드 안내 — 실제 발송된 것처럼 보이지 않도록 명확하게 구분
// ---------------------------------------------------------------------------

export function TestModeNotice({ code, channel }: { code: string | null; channel: 'email' | 'phone' }) {
  return (
    <aside className="test-notice" aria-label="테스트 모드 안내">
      <span className="test-badge">테스트 모드</span>
      <p>
        서버와 {channel === 'email' ? '메일' : '문자'} 발송이 연결되지 않아 실제로 전송되지 않았어요.
        {code ? (
          <>
            {' '}
            아래 테스트 인증코드를 사용해 주세요.
            <strong className="test-code" aria-label={`테스트 인증코드 ${code.split('').join(' ')}`}>
              {code}
            </strong>
          </>
        ) : (
          ' 인증코드를 다시 받아 주세요.'
        )}
      </p>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// 약관 동의
// ---------------------------------------------------------------------------

export function ConsentRow({
  checked,
  onChange,
  label,
  onDetail,
  invalid,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  onDetail: () => void;
  invalid?: boolean;
}) {
  return (
    <div className={`consent-row ${invalid ? 'is-invalid' : ''}`}>
      <label className="consent-check">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <img src={checked ? circleCheck : circle} alt="" width={20} height={20} />
        <span>{label}</span>
      </label>
      <button type="button" className="consent-detail" aria-label={`${label} 내용 보기`} onClick={onDetail}>
        <img src={chevronRight} alt="" width={14} height={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 인증코드 입력 (Figma "Code boxes" — 4칸)
// ---------------------------------------------------------------------------

export function CodeInput({
  value,
  onChange,
  status,
  disabled,
  length = 4,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  status: 'default' | 'error' | 'success';
  disabled?: boolean;
  length?: number;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const setAt = (index: number, ch: string) => {
    const next = chars.slice();
    next[index] = ch;
    onChange(next.join('').slice(0, length));
  };

  const handleInput = (index: number, raw: string) => {
    const typed = clean(raw);
    if (!typed) {
      setAt(index, '');
      return;
    }
    if (typed.length > 1) {
      // 자동완성/붙여넣기로 여러 글자가 들어온 경우
      const next = (chars.slice(0, index).join('') + typed).slice(0, length);
      onChange(next);
      refs.current[Math.min(next.length, length - 1)]?.focus();
      return;
    }
    setAt(index, typed);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      e.preventDefault();
      setAt(index - 1, '');
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = clean(e.clipboardData.getData('text'));
    if (!text) return;
    e.preventDefault();
    onChange(text.slice(0, length));
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className={`code-boxes code-${status}`} role="group" aria-label="인증코드 4자리" aria-describedby={describedBy}>
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="code-box"
          value={ch}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          spellCheck={false}
          maxLength={i === 0 ? length : 1}
          aria-label={`인증코드 ${i + 1}번째 자리`}
          aria-invalid={status === 'error' || undefined}
          disabled={disabled}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 토스트
// ---------------------------------------------------------------------------

export function ToastHost() {
  const { toast } = useAppState();
  return (
    <div className="toast-host" aria-live="polite" role="status">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
