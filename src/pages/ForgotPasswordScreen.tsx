import { SafeForm } from '../components/SafeForm';
import { FormEvent, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { GuidanceCard } from '../components/AuthParts';
import { FormAlert, InlineLink, MethodTabs, PrimaryButton, TextField } from '../components/FormControls';
import { shieldGray } from '../components/icons';
import { accountExists, sendCode } from '../lib/testAuthService';
import { useNav } from '../lib/navigation';
import { useAppMenu } from '../lib/useAppMenu';
import { ContactMethod, formatPhone, validateContact } from '../lib/validation';

/** Mobile 04 Forgot Password · 계정 이메일 (휴대폰 번호 탭 추가) */
export function ForgotPasswordScreen() {
  const { back, push } = useNav();
  const menu = useAppMenu();
  const [method, setMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const contact = method === 'email' ? email : phone;
  const error = submitted ? validateContact(method, contact) : null;
  const isEmail = method === 'email';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setNotFound(false);
    if (validateContact(method, contact)) return;
    if (!accountExists(method, contact)) {
      setNotFound(true);
      return;
    }
    setLoading(true);
    await sendCode('reset', method, contact);
    setLoading(false);
    push({ name: 'verify', purpose: 'reset', method, contact });
  };

  return (
    <ScreenShell frame="Mobile 04 Forgot Password" tone="brand" title="비밀번호 찾기" onBack={back} menu={menu} contentClassName="content-ink">
      <ol className="steps" aria-label="진행 단계">
        <li aria-current="step">01 {isEmail ? '이메일' : '휴대폰'} 확인</li>
        <li>02 인증</li>
        <li>03 새 비밀번호</li>
      </ol>

      <div className="intro intro-ink">
        <p className="intro-title">
          가입한 계정 {isEmail ? '이메일을' : '휴대폰 번호를'}
          <br />
          알려주세요
        </p>
        <p className="intro-sub">본인 확인을 위한 인증코드를 보내드릴게요.</p>
      </div>

      <SafeForm className="forgot-form" onSubmit={onSubmit} noValidate>
        <div className="stack-6">
          <MethodTabs
            label="본인 확인 방법 선택"
            value={method}
            onChange={(m) => {
              setMethod(m);
              setSubmitted(false);
              setNotFound(false);
            }}
          />
          {isEmail ? (
            <TextField
              key="email"
              label="계정 이메일"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seoyeon.kim@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setNotFound(false);
              }}
              hint="가입할 때 사용한 이메일을 입력해 주세요."
              error={error}
              required
            />
          ) : (
            <TextField
              key="phone"
              label="계정 휴대폰 번호"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                setNotFound(false);
              }}
              hint="가입할 때 사용한 휴대폰 번호를 입력해 주세요."
              error={error}
              required
            />
          )}
        </div>

        {notFound && (
          <FormAlert>
            이 {isEmail ? '이메일' : '휴대폰 번호'}로 가입된 계정을 찾지 못했어요.{' '}
            <button type="button" className="link-button" onClick={() => push({ name: 'signup' })}>
              새로 가입하기
            </button>
          </FormAlert>
        )}

        <PrimaryButton loading={loading} loadingText="인증코드 준비 중…">
          인증코드 보내기
        </PrimaryButton>
      </SafeForm>

      <GuidanceCard icon={shieldGray} title="안전하게 다시 시작해요">
        {isEmail ? '이메일' : '문자'} 인증을 마친 뒤 새 비밀번호를 설정할 수 있어요.
      </GuidanceCard>

      <InlineLink lead="비밀번호가 생각났나요?" action="로그인으로 돌아가기" onClick={back} className="text-13" />
    </ScreenShell>
  );
}
