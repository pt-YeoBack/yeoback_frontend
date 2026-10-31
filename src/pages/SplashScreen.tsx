import { useEffect } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { logo } from '../components/icons';
import { Route, useNav } from '../lib/navigation';
import { getSessionUser } from '../lib/testAuthService';

/** Mobile 01 First Launch · 여백 로고 → 3초 후(또는 로고를 누르면) Mobile 01B 로 이동 */
export function SplashScreen({ route }: { route?: Extract<Route, { name: 'splash' }> }) {
  const { replace } = useNav();
  // 이미 로그인한 테스트 세션이 있으면 온보딩 대신 홈으로 이동
  const next: Route = getSessionUser() ? { name: 'home', welcome: 'login' } : { name: 'onboarding' };

  const stay = Boolean(route?.stay);

  useEffect(() => {
    // 온보딩에서 '이전'으로 돌아온 경우엔 자동으로 넘기지 않고 로고를 눌러야 다음으로 이동
    if (stay) return;
    const id = window.setTimeout(() => replace(next), 3000);
    return () => window.clearTimeout(id);
  }, [replace, stay]);

  return (
    <ScreenShell frame="Mobile 01 First Launch" tone="brand" contentClassName="splash-content">
      <button
        type="button"
        className="splash-logo"
        onClick={() => replace(next)}
        aria-label="여백 Yeobaek — 시작하기"
      >
        <img src={logo} alt="" width={115} height={115} />
        <span className="splash-wordmark" aria-hidden="true">여백</span>
        <span className="splash-sub" aria-hidden="true">Y E O B A E K</span>
      </button>
      {stay && <p className="splash-hint">로고를 누르면 다시 시작해요</p>}
    </ScreenShell>
  );
}
