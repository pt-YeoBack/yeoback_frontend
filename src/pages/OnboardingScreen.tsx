import { ScreenShell } from '../components/ScreenShell';
import { backIcons, bookHeart, calendar, mapPin } from '../components/icons';
import heroImage from '../assets/onboarding-hero.jpg';
import { useNav } from '../lib/navigation';

const FEATURES = [
  { icon: calendar, title: '내 속도에 맞는 여행 계획', body: '가고 싶은 곳을 모아 일정을 만들어요.' },
  { icon: mapPin, title: '빈 시간엔, 가까운 발견', body: 'AI가 주변의 어울리는 장소를 찾아줘요.' },
  { icon: bookHeart, title: '인연도 기록도, 나의 수첩에', body: '원할 때만 연결하고, 추억은 저장해요.' },
];

/** Mobile 01B Onboarding · 계획 사이 새로운 발견 */
export function OnboardingScreen() {
  const { push, replace } = useNav();

  return (
    <ScreenShell frame="Mobile 01B Onboarding" tone="brand" contentClassName="onboarding-content">
      {/* Figma에 없는 부분: 메인 로고(Mobile 01)로 돌아가는 '이전' 버튼 */}
      <button
        type="button"
        className="nav-back onboarding-back"
        aria-label="이전 · 메인 로고 화면으로"
        onClick={() => replace({ name: 'splash', stay: true })}
      >
        <img src={backIcons.brand} alt="" width={22} height={22} />
      </button>
      <div className="onboarding-intro">
        <div className="onboarding-brand">
          <img data-tint className="onboarding-hero" src={heroImage} alt="" width={346} height={115} />
          <h1 className="onboarding-title" tabIndex={-1}>
            계획 사이, 새로운 발견 <span aria-hidden="true">✈️</span>
          </h1>
          <p className="onboarding-lead">
            나만의 속도로 여행하고,
            <br />
            우연히 만난 인연까지 간직해요.
          </p>
        </div>
        <ul className="onboarding-features">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className="feature-symbol" aria-hidden="true">
                <img src={f.icon} alt="" width={20} height={20} />
              </span>
              <span className="feature-text">
                <strong>{f.title}</strong>
                <span>{f.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="onboarding-actions">
        <button type="button" className="btn-primary btn-tall" onClick={() => push({ name: 'signup' })}>
          계정 만들기
        </button>
        <button type="button" className="btn-text" onClick={() => push({ name: 'login' })}>
          로그인
        </button>
      </div>
    </ScreenShell>
  );
}
