import { useEffect, useRef } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { ChoiceChips, Switch } from '../components/WorldParts';
import { checkWhite, palette, shieldCheck, sliders } from '../components/icons';
import { ACCENT_PALETTES, isCustomAccent, paletteOf, swatchGradient } from '../lib/accent';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { resetTestData, setSession } from '../lib/testAuthService';
import { KEYWORD_OPTIONS, TASTE_OPTIONS, useWorld } from '../lib/worldStore';

/** Mobile 22 (두 번째 프레임) · 세부 설정 — 여행 취향 · 공개 범위 · 대화 보관 */
export function SettingsScreen({ route }: { route: Extract<Route, { name: 'settings' }> }) {
  const { back, canGoBack, reset } = useNav();
  const { showToast, clearSignupDraft } = useAppState();
  const { profile, updateProfile } = useWorld();
  const privacyRef = useRef<HTMLElement>(null);
  const colorRef = useRef<HTMLElement>(null);
  const current = paletteOf(profile.accent);
  const custom = profile.accent && isCustomAccent(profile.accent) ? paletteOf(profile.accent) : null;
  const pick = (id: string, label: string) => {
    updateProfile({ accent: id });
    showToast(`프로필 액센트를 '${label}' 조합으로 바꿨어요.`);
  };

  useEffect(() => {
    if (route.section === 'privacy') privacyRef.current?.scrollIntoView({ block: 'start' });
    if (route.section === 'color') colorRef.current?.scrollIntoView({ block: 'start' });
  }, [route.section]);

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const setPrivacy = (patch: Partial<typeof profile.privacy>) => updateProfile({ privacy: { ...profile.privacy, ...patch } });

  return (
    <ScreenShell
      frame="Mobile 22 Settings"
      tone="brand"
      title="세부 설정"
      onBack={canGoBack ? back : () => reset({ name: 'profile' })}
      trailing={<BellButton />}
      contentClassName="settings-content"
      bottomNav={<BottomNav active="profile" />}
    >
      <section aria-labelledby="taste-title">
        <h2 id="taste-title" className="guidance-title settings-heading">
          <img src={sliders} alt="" width={22} height={22} />
          여행 취향 수정
        </h2>
        <div className="settings-box">
          <ChoiceChips
            label="여행 취향 (여러 개 선택)"
            options={TASTE_OPTIONS}
            selected={profile.tastes}
            variant="soft"
            onToggle={(t) => updateProfile({ tastes: toggle(profile.tastes, t) })}
          />
          <ChoiceChips
            label="여행 키워드 (여러 개 선택)"
            options={KEYWORD_OPTIONS}
            selected={profile.keywords}
            variant="soft"
            onToggle={(t) => updateProfile({ keywords: toggle(profile.keywords, t) })}
          />
        </div>
        <p className="form-help">고른 취향은 바로 저장되고 프로필에 보여요. 선택 {profile.tastes.length + profile.keywords.length}개</p>
      </section>

      <section aria-labelledby="privacy-title" ref={privacyRef}>
        <h2 id="privacy-title" className="guidance-title settings-heading">
          <img src={shieldCheck} alt="" width={22} height={22} />
          닉네임·공개 범위·대화 보관 설정
        </h2>
        <div className="settings-box settings-switches">
          <Switch
            label="닉네임 공개"
            description="끄면 인연 모임과 대화에서 닉네임 대신 '여행자'로 표시돼요."
            checked={profile.privacy.nickname}
            onChange={(v) => setPrivacy({ nickname: v })}
          />
          <Switch
            label="연락처 공개"
            description="켜도 이 데모에서는 누구에게도 연락처가 전달되지 않아요."
            checked={profile.privacy.contact}
            onChange={(v) => setPrivacy({ contact: v })}
          />
          <Switch
            label="수첩 대화 기록 자동 저장"
            description="끄면 수첩에서 저장된 대화가 보이지 않아요."
            checked={profile.privacy.autosave}
            onChange={(v) => setPrivacy({ autosave: v })}
          />
        </div>
      </section>


      <section aria-labelledby="color-title" ref={colorRef}>
        <h2 id="color-title" className="guidance-title settings-heading color-heading">
          <img src={palette} alt="" width={22} height={22} />
          컬러 조합 선택
        </h2>
        <div className="color-widget">
          <div className="palette-row" role="radiogroup" aria-label="프로필 컬러 조합">
            {ACCENT_PALETTES.map((p) => {
              const on = current.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={p.label}
                  className={`palette-chip ${on ? 'is-on' : ''}`}
                  style={{ background: p.swatch[0] }}
                  onClick={() => pick(p.id, p.label)}
                >
                  <span className="palette-swatch" style={{ background: swatchGradient(p.swatch) }} />
                  {on && <img className="palette-check" src={checkWhite} alt="" width={18} height={18} />}
                </button>
              );
            })}
            {/* Figma의 '+' 칩: 직접 색을 고르는 동작은 해석해 추가 (브라우저 기본 색 선택기) */}
            <label
              className={`palette-chip palette-add ${custom ? 'is-on' : ''}`}
              style={custom ? { background: custom.swatch[0] } : undefined}
              title={custom ? custom.label : '직접 색 고르기'}
            >
              {custom ? (
                <>
                  <span className="palette-swatch" style={{ background: swatchGradient(custom.swatch) }} />
                  <img className="palette-check" src={checkWhite} alt="" width={18} height={18} />
                </>
              ) : (
                <span aria-hidden="true">+</span>
              )}
              <span className="sr-only">{custom ? `${custom.label} 선택됨 · 다른 색 고르기` : '직접 색 고르기'}</span>
              <input
                type="color"
                className="sr-only"
                value={custom ? custom.id : '#84afff'}
                onChange={(e) => pick(e.target.value.toLowerCase(), `직접 고른 색 ${e.target.value}`)}
              />
            </label>
          </div>
          <p className="color-help">원하는 컬러 조합을 선택해 프로필의 액센트를 변경하세요.</p>
        </div>
      </section>

      {/* Figma에 없는 부분: 기존 홈 프로필 시트에 있던 계정 기능을 여기로 옮김 */}
      <section className="account-box" aria-label="계정">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setSession(null);
            reset({ name: 'onboarding' });
          }}
        >
          로그아웃
        </button>
        <button
          type="button"
          className="btn-text btn-text-danger"
          onClick={() => {
            resetTestData();
            clearSignupDraft();
            try {
              Object.keys(window.localStorage)
                .filter((k) => k.startsWith('yeobaek.'))
                .forEach((k) => window.localStorage.removeItem(k));
              window.sessionStorage.removeItem('yeobaek.navStack');
            } catch {
              /* noop */
            }
            showToast('테스트 데이터를 모두 지웠어요.');
            reset({ name: 'onboarding' });
            window.location.reload();
          }}
        >
          테스트 데이터 모두 초기화
        </button>
      </section>
    </ScreenShell>
  );
}
