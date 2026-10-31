import { SafeForm } from '../components/SafeForm';
import { FormEvent, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { ConsentRow, SocialLogin } from '../components/AuthParts';
import { FormAlert, InlineLink, MethodTabs, PasswordField, PrimaryButton, TextField } from '../components/FormControls';
import { useAppState } from '../lib/appState';
import { useNav } from '../lib/navigation';
import { useAppMenu } from '../lib/useAppMenu';
import { accountExists, sendCode } from '../lib/testAuthService';
import {
  checkPassword,
  formatPhone,
  validateConfirm,
  validateContact,
  validateName,
  validatePassword,
} from '../lib/validation';

type FieldKey = 'name' | 'contact' | 'password' | 'confirm' | 'consent';

/** Mobile 02 Create Account · 계정 만들기 */
export function CreateAccountScreen() {
  const { back, push } = useNav();
  const menu = useAppMenu();
  const { signupDraft: d, setSignupDraft, showToast } = useAppState();
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  const contact = d.method === 'email' ? d.email : d.phone;
  const errors: Record<FieldKey, string | null> = {
    name: validateName(d.name),
    contact: validateContact(d.method, contact),
    password: validatePassword(d.password),
    confirm: validateConfirm(d.password, d.confirm),
    consent: d.agreeTerms && d.agreeAge ? null : '필수 약관에 모두 동의해 주세요.',
  };
  const show = (k: FieldKey) => (submitted || touched[k] ? errors[k] : null);
  const blur = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  const pw = checkPassword(d.password);
  const pwHintMet = pw.length && pw.letter && pw.number && pw.special;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setDuplicate(false);
    if (Object.values(errors).some(Boolean)) {
      const first = (['name', 'contact', 'password', 'confirm'] as const).find((k) => errors[k]);
      if (first) document.querySelector<HTMLInputElement>(`[data-field="${first}"] input`)?.focus();
      return;
    }
    if (accountExists(d.method, contact)) {
      setDuplicate(true);
      return;
    }
    setLoading(true);
    await sendCode('signup', d.method, contact);
    setLoading(false);
    push({ name: 'checkInbox', method: d.method, contact });
  };

  return (
    <ScreenShell frame="Mobile 02 Create Account" tone="ink" title="계정 만들기" onBack={back} menu={menu}>
      <div className="intro intro-compact">
        <p className="intro-title intro-title-22">여백과 시작해요</p>
        <p className="intro-sub intro-sub-12">여행과 대화를 나만의 수첩에.</p>
      </div>

      <SafeForm className="stack-18" onSubmit={onSubmit} noValidate>
        <div className="stack-12">
          <div data-field="name">
            <TextField
              label="이름"
              name="name"
              autoComplete="name"
              placeholder="김서연"
              value={d.name}
              onChange={(e) => setSignupDraft({ name: e.target.value })}
              onBlur={blur('name')}
              error={show('name')}
              required
            />
          </div>

          <div className="stack-6" data-field="contact">
            <MethodTabs
              label="가입 방법 선택"
              value={d.method}
              onChange={(method) => {
                setSignupDraft({ method });
                setTouched((t) => ({ ...t, contact: false }));
                setDuplicate(false);
              }}
            />
            {d.method === 'email' ? (
              <TextField
                key="email"
                label="이메일"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seoyeon.kim@email.com"
                value={d.email}
                onChange={(e) => {
                  setSignupDraft({ email: e.target.value });
                  setDuplicate(false);
                }}
                onBlur={blur('contact')}
                error={show('contact')}
                required
              />
            ) : (
              <TextField
                key="phone"
                label="휴대폰 번호"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="010-1234-5678"
                value={d.phone}
                onChange={(e) => {
                  setSignupDraft({ phone: formatPhone(e.target.value) });
                  setDuplicate(false);
                }}
                onBlur={blur('contact')}
                error={show('contact')}
                required
              />
            )}
          </div>

          <div data-field="password">
            <PasswordField
              label="비밀번호"
              name="new-password"
              autoComplete="new-password"
              value={d.password}
              onChange={(e) => setSignupDraft({ password: e.target.value })}
              onBlur={blur('password')}
              hint="영문·숫자·특수문자 포함 8자 이상"
              error={show('password')}
              success={d.password && pwHintMet ? '사용할 수 있는 비밀번호예요.' : null}
              required
            />
          </div>

          <div data-field="confirm">
            <PasswordField
              label="비밀번호 확인"
              name="confirm-password"
              autoComplete="new-password"
              value={d.confirm}
              onChange={(e) => setSignupDraft({ confirm: e.target.value })}
              onBlur={blur('confirm')}
              error={show('confirm')}
              success={d.confirm && d.confirm === d.password ? '두 비밀번호가 일치해요.' : null}
              required
            />
          </div>
        </div>

        <fieldset className="consent">
          <legend className="sr-only">약관 동의</legend>
          <ConsentRow
            label="[필수] 이용약관 및 개인정보 수집 동의"
            checked={d.agreeTerms}
            onChange={(v) => setSignupDraft({ agreeTerms: v })}
            onDetail={() => showToast('약관 상세 화면은 아직 준비 중이에요.')}
            invalid={submitted && !d.agreeTerms}
          />
          <ConsentRow
            label="[필수] 만 14세 이상입니다"
            checked={d.agreeAge}
            onChange={(v) => setSignupDraft({ agreeAge: v })}
            onDetail={() => showToast('약관 상세 화면은 아직 준비 중이에요.')}
            invalid={submitted && !d.agreeAge}
          />
          <ConsentRow
            label="[선택] 여행 소식 받기"
            checked={d.agreeMarketing}
            onChange={(v) => setSignupDraft({ agreeMarketing: v })}
            onDetail={() => showToast('약관 상세 화면은 아직 준비 중이에요.')}
          />
          {show('consent') && (
            <p className="field-message consent-error" role="alert">
              {errors.consent}
            </p>
          )}
        </fieldset>

        {duplicate && (
          <FormAlert>
            이미 가입된 {d.method === 'email' ? '이메일' : '휴대폰 번호'}이에요.{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => push({ name: 'login', method: d.method, contact })}
            >
              로그인하기
            </button>
          </FormAlert>
        )}

        <PrimaryButton loading={loading} loadingText="인증코드 준비 중…">
          동의하고 계정 만들기
        </PrimaryButton>
      </SafeForm>

      <SocialLogin caption="또는 소셜 계정으로 시작하기" mode="signup" />

      <InlineLink lead="이미 계정이 있나요?" action="로그인" onClick={() => push({ name: 'login' })} />
    </ScreenShell>
  );
}
