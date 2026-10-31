import { InputHTMLAttributes, ReactNode, useId, useState } from 'react';
import { ContactMethod } from '../lib/validation';
import { eyeOffIcons } from './icons';

type FieldStatus = 'default' | 'error' | 'success';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  success?: string | null;
  trailing?: ReactNode;
}

/** Figma "Input field" — 라벨 12px Bold, 입력 50px · radius 14, 보조문구 11px */
export function TextField({ label, hint, error, success, trailing, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const status: FieldStatus = error ? 'error' : success ? 'success' : 'default';
  const message = error ?? success ?? hint;
  const messageId = message ? `${id}-msg` : undefined;

  return (
    <div className={`field field-${status} ${className ?? ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-input">
        <input
          id={id}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={messageId}
          {...inputProps}
        />
        {trailing}
      </div>
      {message && (
        <p id={messageId} className="field-message" role={error ? 'alert' : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'trailing'> {
  iconTone?: keyof typeof eyeOffIcons;
}

export function PasswordField({ iconTone = 'gray', label, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...rest}
      label={label}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className={`field-toggle toggle-${iconTone}`}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `${label} 숨기기` : `${label} 표시`}
          aria-pressed={visible}
        >
          {visible ? <EyeIcon /> : <img src={eyeOffIcons[iconTone]} alt="" width={18} height={18} />}
        </button>
      }
    />
  );
}

/** Figma에는 "숨김(eye-off)" 아이콘만 있어 같은 선 굵기로 "표시(eye)" 아이콘을 추가했습니다. */
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1.546 9.261a.75.75 0 0 1 0-.522C2.9 5.444 5.7 3.75 9 3.75s6.1 1.694 7.454 4.989a.75.75 0 0 1 0 .522C15.1 12.556 12.3 14.25 9 14.25s-6.1-1.694-7.454-4.989Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** 이메일 / 휴대폰 번호 전환 탭 (Figma에 없는 요소 — 요청에 따라 추가) */
export function MethodTabs({
  value,
  onChange,
  label,
}: {
  value: ContactMethod;
  onChange: (m: ContactMethod) => void;
  label: string;
}) {
  const options: { key: ContactMethod; text: string }[] = [
    { key: 'email', text: '이메일' },
    { key: 'phone', text: '휴대폰 번호' },
  ];
  return (
    <div className="method-tabs" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          className={value === o.key ? 'is-active' : undefined}
          onClick={() => onChange(o.key)}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  loadingText = '처리 중…',
  type = 'submit',
  onClick,
  disabled,
  tall,
}: {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  type?: 'submit' | 'button';
  onClick?: () => void;
  disabled?: boolean;
  tall?: boolean;
}) {
  return (
    <button
      type={type}
      className={`btn-primary ${tall ? 'btn-tall' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? loadingText : children}
    </button>
  );
}

/** 문장 속 링크형 버튼: "이미 계정이 있나요?  로그인" */
export function InlineLink({
  lead,
  action,
  onClick,
  className,
}: {
  lead?: string;
  action: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <p className={`inline-link ${className ?? ''}`}>
      {lead && <span>{lead}</span>}
      {lead && '  '}
      <button type="button" className="link-button" onClick={onClick}>
        {action}
      </button>
    </p>
  );
}

export function FormAlert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' }) {
  return (
    <div className={`form-alert form-alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
