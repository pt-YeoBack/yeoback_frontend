import { ReactNode, useEffect } from 'react';
import { ToastHost } from './components/AuthParts';
import { AppStateProvider } from './lib/appState';
import { NavigationProvider, useNav } from './lib/navigation';
import { getSessionUser } from './lib/testAuthService';
import { TripProvider, useTrips } from './lib/tripStore';
import { WorldProvider, useWorld } from './lib/worldStore';
import { applyTheme, deviceAccent, rememberDeviceAccent } from './lib/themeRuntime';
import { ArchiveScreen } from './pages/ArchiveScreen';
import { ChatScreen } from './pages/ChatScreen';
import { ConnectionsScreen } from './pages/ConnectionsScreen';
import { DayPlanScreen } from './pages/DayPlanScreen';
import { GatheringNewScreen } from './pages/GatheringNewScreen';
import { GatheringScreen } from './pages/GatheringScreen';
import { NearbyScreen } from './pages/NearbyScreen';
import { NotebookScreen } from './pages/NotebookScreen';
import { ProfileEditScreen } from './pages/ProfileEditScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { ReviewScreen } from './pages/ReviewScreen';
import { SchedulesScreen } from './pages/SchedulesScreen';
import { MemberProfileScreen } from './pages/MemberProfileScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { SuggestionsScreen } from './pages/SuggestionsScreen';
import { CheckInboxScreen } from './pages/CheckInboxScreen';
import { CreateAccountScreen } from './pages/CreateAccountScreen';
import { ForgotPasswordScreen } from './pages/ForgotPasswordScreen';
import { HomeScreen } from './pages/HomeScreen';
import { ItineraryScreen } from './pages/ItineraryScreen';
import { LoginScreen } from './pages/LoginScreen';
import { NewPasswordScreen } from './pages/NewPasswordScreen';
import { NewTripScreen } from './pages/NewTripScreen';
import { OnboardingScreen } from './pages/OnboardingScreen';
import { SplashScreen } from './pages/SplashScreen';
import { VerifyCodeScreen } from './pages/VerifyCodeScreen';

function CurrentScreen() {
  const { route } = useNav();
  switch (route.name) {
    case 'splash':
      return <SplashScreen route={route} />;
    case 'onboarding':
      return <OnboardingScreen />;
    case 'signup':
      return <CreateAccountScreen />;
    case 'login':
      return <LoginScreen key={`${route.method}-${route.contact}`} route={route} />;
    case 'forgot':
      return <ForgotPasswordScreen />;
    case 'checkInbox':
      return <CheckInboxScreen route={route} />;
    case 'verify':
      return <VerifyCodeScreen key={`${route.purpose}-${route.contact}`} route={route} />;
    case 'newPassword':
      return <NewPasswordScreen route={route} />;
    case 'home':
      return <HomeScreen />;
    case 'newTrip':
      return <NewTripScreen route={route} />;
    case 'itinerary':
      return <ItineraryScreen route={route} />;
    case 'schedules':
      return <SchedulesScreen />;
    case 'dayPlan':
      return <DayPlanScreen key={route.tripId} route={route} />;
    case 'nearby':
      return <NearbyScreen key={`${route.tripId}-${route.day}`} route={route} />;
    case 'suggestions':
      return <SuggestionsScreen key={`${route.tripId}-${route.day}`} route={route} />;
    case 'review':
      return <ReviewScreen key={route.activityId} route={route} />;
    case 'connections':
      return <ConnectionsScreen route={route} />;
    case 'gathering':
      return <GatheringScreen key={route.id} route={route} />;
    case 'gatheringNew':
      return <GatheringNewScreen />;
    case 'chat':
      return <ChatScreen key={route.id} route={route} />;
    case 'profile':
      return <ProfileScreen />;
    case 'notebook':
      return <NotebookScreen key={route.tripId} route={route} />;
    case 'archive':
      return <ArchiveScreen key={route.gatheringId} route={route} />;
    case 'profileEdit':
      return <ProfileEditScreen />;
    case 'settings':
      return <SettingsScreen route={route} />;
    case 'member':
      return <MemberProfileScreen route={route} />;
    default:
      return null;
  }
}

/** 로그인한 계정별로 여행 데이터를 분리한다. 화면 이동마다 다시 계산되므로 로그인/로그아웃 직후 바로 반영된다. */
function SessionScope({ children }: { children: ReactNode }) {
  useNav();
  const user = getSessionUser();
  const owner = user ? user.email ?? user.phone ?? null : null;
  return (
    <TripProvider key={owner ?? 'guest'} owner={owner}>
      <WorldScope owner={owner}>{children}</WorldScope>
    </TripProvider>
  );
}

/** Mobile 13~22 데이터(프로필·인연·대화). 예시 모임 날짜를 첫 여행에 맞추려고 여행 목록 안쪽에 둔다 */
function WorldScope({ owner, children }: { owner: string | null; children: ReactNode }) {
  const { trips } = useTrips();
  const first = [...trips].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))[0];
  return (
    <WorldProvider key={owner ?? 'guest'} owner={owner} baseDate={first?.startDate ?? null}>
      <AccentTheme enabled={Boolean(owner)} />
      {children}
    </WorldProvider>
  );
}

/** 로그인한 사용자의 컬러 조합을 앱 전체(글자·버튼·배경·아이콘)에 적용. 로그아웃하면 기본색으로 */
function AccentTheme({ enabled }: { enabled: boolean }) {
  const { profile } = useWorld();
  // 로그인 전 화면(로그인 · 인증 메일 · 문자 등)은 이 기기에서 마지막으로 고른 조합을 따른다
  const accent = enabled ? profile.accent : deviceAccent();
  useEffect(() => {
    if (enabled) rememberDeviceAccent(accent);
    applyTheme(accent);
  }, [accent, enabled]);
  useEffect(() => () => applyTheme(null), []);
  return null;
}

export default function App() {
  return (
    <AppStateProvider>
      <NavigationProvider initial={{ name: 'splash' }} restore={Boolean(getSessionUser())}>
        <SessionScope>
          <div className="app-stage">
            <CurrentScreen />
          </div>
        </SessionScope>
        <ToastHost />
      </NavigationProvider>
    </AppStateProvider>
  );
}
