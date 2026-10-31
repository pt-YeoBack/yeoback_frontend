import { SafeForm } from '../components/SafeForm';
import { FormEvent, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { SocialLogin } from '../components/AuthParts';
import { FormAlert, InlineLink, MethodTabs, PasswordField, PrimaryButton, TextField } from '../components/FormControls';
import { login } from '../lib/testAuthService';
import { Route, useNav } from '../lib/navigation';
import { useAppMenu } from '../lib/useAppMenu';
import { ContactMethod, formatPhone, validateContact } from '../lib/validation';

/** Mobile 03 Login · 다시 만나는 여백 */
export function LoginScreen({ route }: { route: Extract<Route, { name: 'login' }> }) {
  const { back, push, reset, canGoBack } = useNav();
  const menu = useAppMenu();
  const [method, setMethod] = useState<ContactMethod>(route.method ?? 'email');
  const [email, setEmail] = useState(route.method === 'email' ? route.contact ?? '' : '');
  const [phone, setPhone] = useState(route.method === 'phone' ? formatPhone(route.contact ?? '') : '');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);

  const contact = method === 'email' ? email : phone;
  const contactError = submitted ? validateContact(method, contact) : null;
  const passwordError = submitted && !password ? '비밀번호를 입력해 주세요.' : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFailure(null);
    if (validateContact(method, contact) || !password) return;
    setLoading(true);
    const result = await login(method, contact, password);
    setLoading(false);
    if (result.ok) {
      reset({ name: 'home', welcome: 'login' });
      return;
    }
    const next = failCount + 1;
    setFailCount(next);
    setFailure(
      `${method === 'email' ? '이메일' : '휴대폰 번호'} 또는 비밀번호가 일치하지 않아요.` +
        (next >= 3 ? ' 비밀번호가 기억나지 않으면 재설정해 주세요.' : ''),
    );
  };

  const switchMethod = (m: ContactMethod) => {
    setMethod(m);
    setFailure(null);
    setSubmitted(false);
  };

  return (
    <ScreenShell
      frame="Mobile 03 Login"
      tone="brand"
      title="로그인"
      onBack={canGoBack ? back : () => reset({ name: 'onboarding' })}
      menu={menu}
    >
      <div className="intro">
        <p className="intro-title">다시 만나 반가워요</p>
        <p className="intro-sub">남겨둔 여행과 대화가 기다리고 있어요.</p>
      </div>

      {route.notice && <FormAlert tone="success">{route.notice}</FormAlert>}

      <SafeForm className="stack-18" onSubmit={onSubmit} noValidate>
        <div className="stack-6">
          <MethodTabs label="로그인 방법 선택" value={method} onChange={switchMethod} />
          {method === 'email' ? (
            <TextField
              key="email"
              label="이메일"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="seoyeon.kim@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={contactError}
              required
            />
          ) : (
            <TextField
              key="phone"
              label="휴대폰 번호"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              error={contactError}
              required
            />
          )}
        </div>

        <PasswordField
          label="비밀번호"
          name="password"
          autoComplete="current-password"
          iconTone="brand"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          required
        />

        <button type="button" className="link-strong" onClick={() => push({ name: 'forgot' })}>
          비밀번호를 잊으셨나요?
        </button>

        {failure && <FormAlert>{failure}</FormAlert>}

        <PrimaryButton loading={loading} loadingText="로그인 중…">
          로그인
        </PrimaryButton>
      </SafeForm>

      <SocialLogin caption="또는 소셜 계정으로 로그인" mode="login" />

      <InlineLink lead="여백이 처음인가요?" action="계정 만들기" onClick={() => push({ name: 'signup' })} />
  </ScreenShell> );
}
