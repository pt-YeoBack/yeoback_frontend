import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { GuidanceCard, TestModeNotice } from '../components/AuthParts';
import { mail } from '../components/icons';
import envelopeImage from '../assets/email-envelope.jpg';
import messageImage from '../assets/message-bubble.jpg';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { useAppMenu } from '../lib/useAppMenu';
import { formatMMSS, useCountdown } from '../lib/useCountdown';
import { peekCode, sendCode, SentCode } from '../lib/testAuthService';
import { displayContact } from '../lib/validation';

/**
 * Mobile 05 Check Email · 이메일 확인 (이메일 가입)
 * Mobile 05.2 Check Message · 메세지함 확인 (휴대폰 가입)
 */
export function CheckInboxScreen({ route }: { route: Extract<Route, { name: 'checkInbox' }> }) {
  const { back, push } = useNav();
  const menu = useAppMenu();
  const { showToast } = useAppState();
  const { method, contact } = route;
  const isEmail = method === 'email';
  const [sent, setSent] = useState<SentCode | null>(() => peekCode('signup', method, contact));
  const [resending, setResending] = useState(false);
  const cooldown = useCountdown(sent?.resendAvailableAt ?? null);

  useEffect(() => {
    // 새로고침 등으로 코드가 없으면 다시 준비
    if (!sent) void sendCode('signup', method, contact).then(setSent);
  }, [sent, method, contact]);

  const resend = async () => {
    setResending(true);
    const next = await sendCode('signup', method, contact);
    setResending(false);
    setSent(next);
    showToast('새 테스트 인증코드를 만들었어요. (실제 발송 없음)', 'success');
  };

  return (
    <ScreenShell
      frame={isEmail ? 'Mobile 05 Check Email' : 'Mobile 05.2 Check Message'}
      tone="brand"
      title="계정 만들기"
      onBack={back}
      menu={menu}
    >
      <div className="delivery-illustration" aria-hidden="true">
        <img data-tint src={isEmail ? envelopeImage : messageImage} alt="" width={120} height={120} />
      </div>

      <div className="intro">
        <p className="intro-title">{isEmail ? '이메일을 확인해주세요' : '메세지함을 확인해주세요'}</p>
        <p className="intro-sub">아래 {isEmail ? '주소' : '번호'}로 영문·숫자 4자리 인증코드를 보냈어요.</p>
      </div>

      <div className="contact-card">
        <p className="contact-card-value">{displayContact(method, contact)}</p>
        <p className="contact-card-help">
          {isEmail
            ? '메일의 인증코드를 확인한 뒤 입력해 주세요.'
            : '문자로 전송해드린 인증코드를 확인한 뒤 입력해 주세요.'}
        </p>
      </div>

      <TestModeNotice code={sent?.testCode ?? null} channel={method} />

      <button
        type="button"
        className="btn-primary"
        onClick={() => push({ name: 'verify', purpose: 'signup', method, contact })}
      >
        인증코드 입력하기
      </button>

      <GuidanceCard icon={mail} title={isEmail ? '메일이 도착하지 않았나요?' : '문자가 도착하지 않았나요?'}>
        {isEmail
          ? '스팸함을 확인해 주세요. 잠시 후 다시 보낼 수 있어요.'
          : '스팸처리 여부를 확인해 주세요. 잠시 후 다시 보낼 수 있어요.'}
      </GuidanceCard>

      <div className="resend-row">
        <button
          type="button"
          className="link-button link-plain"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          aria-live="polite"
        >
          {resending ? '다시 보내는 중…' : cooldown > 0 ? `다시 보내기 · ${formatMMSS(cooldown)} 후` : '다시 보내기'}
        </button>
        <button type="button" className="link-button link-bold" onClick={() => back()}>
          {isEmail ? '이메일 변경' : '번호 변경'}
        </button>
      </div>
    </ScreenShell>
  );
}
