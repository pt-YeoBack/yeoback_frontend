import { SafeForm } from '../components/SafeForm';
import { FormEvent, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { GuidanceCard } from '../components/AuthParts';
import { FormAlert, PasswordField, PrimaryButton } from '../components/FormControls';
import { shieldSlate } from '../components/icons';
import { Route, useNav } from '../lib/navigation';
import { useAppMenu } from '../lib/useAppMenu';
import { resetPassword } from '../lib/testAuthService';
import { checkPassword, validateConfirm, validatePassword } from '../lib/validation';

/** Mobile 07 New Password · 재설정 완료 */
export function NewPasswordScreen({ route }: { route: Extract<Route, { name: 'newPassword' }> }) {
  const { back, reset } = useNav();
  const menu = useAppMenu();
  const { method, contact } = route;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const done = savedName !== null;

  const pwError = validatePassword(password);
  const confirmError = validateConfirm(password, confirm);
  const pw = checkPassword(password);
  const pwOk = pw.length && pw.letter && pw.number && pw.special;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (done) {
      reset({ name: 'login', method, contact, notice: '새 비밀번호로 로그인해 주세요.' });
      return;
    }
    setSubmitted(true);
    setServerError(null);
    if (pwError || confirmError) return;
    setLoading(true);
    const result = await resetPassword(method, contact, password);
    setLoading(false);
    if (!result.ok) {
      setServerError(
        result.reason === 'same_as_before'
          ? '이전에 사용한 비밀번호예요. 다른 비밀번호를 입력해 주세요.'
          : '계정을 찾지 못했어요. 처음부터 다시 시도해 주세요.',
      );
      return;
    }
    setSavedName(result.user.name);
  };

  return (
    <ScreenShell
      frame="Mobile 07 New Password"
      tone="steel"
      title="새 비밀번호"
      onBack={done ? undefined : back}
      menu={menu}
    >
      <div className="intro">
        <p className="intro-title">
          새 비밀번호로
          <br />
          안전하게 시작해요
        </p>
        <p className="intro-sub">
          {done ? '이전에 사용하지 않은 비밀번호로 변경했어요.' : '이전에 사용하지 않은 비밀번호로 설정해 주세요.'}
        </p>
      </div>

      <SafeForm className="stack-18" onSubmit={onSubmit} noValidate>
        <div className="new-password-form">
          <PasswordField
            label="새 비밀번호"
            autoComplete="new-password"
            iconTone="steel"
            value={password}
            disabled={done}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            hint="영문·숫자·특수문자 포함 8자 이상"
            error={submitted || touched.password ? pwError : null}
            success={!done && password && pwOk ? '사용할 수 있는 비밀번호예요.' : null}
            required
          />
          <PasswordField
            label="새 비밀번호 확인"
            autoComplete="new-password"
            iconTone="steel"
            value={confirm}
            disabled={done}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            error={submitted || touched.confirm ? confirmError : null}
            success={confirm && confirm === password ? '두 비밀번호가 일치해요.' : null}
            required
          />
        </div>

        {serverError && <FormAlert>{serverError}</FormAlert>}

        {done && (
          <GuidanceCard icon={shieldSlate} title="비밀번호가 변경되었어요" tone="success">
            {savedName}님의 계정 {method === 'email' ? '이메일' : '휴대폰'} 인증과 새 비밀번호 저장이 완료되었어요. 새
            비밀번호로 로그인해 주세요.
          </GuidanceCard>
        )}

        <PrimaryButton loading={loading} loadingText="저장 중…">
          {done ? '로그인하고 여행 시작하기' : '새 비밀번호 저장'}
        </PrimaryButton>
      </SafeForm>

      <p className="footnote">여행 기록은 그대로 안전하게 보관돼요.</p>
    </ScreenShell>
  );
}
