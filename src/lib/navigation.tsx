import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ContactMethod } from './validation';
import type { CodePurpose } from './testAuthService';

/**
 * Figma 프레임 ↔ 화면(route) 대응
 *  splash      Mobile 01 First Launch
 *  onboarding  Mobile 01B Onboarding
 *  signup      Mobile 02 Create Account
 *  login       Mobile 03 Login
 *  forgot      Mobile 04 Forgot Password
 *  checkInbox  Mobile 05 Check Email / Mobile 05.2 Check Message
 *  verify      Mobile 06 Verify Code (이메일 · 휴대폰 · 비밀번호 재설정)
 *  newPassword Mobile 07 New Password
 *  home        Mobile 08 Home · 첫 여행을 기다리며
 *  newTrip     Mobile 09 New Plan · 목적지와 날짜 (1/2)
 *  itinerary   Mobile 10 Add Itinerary · 내 손으로 계획 (2/2)
 *  schedules   Mobile 11 My Schedules · 나의 여행
 *  dayPlan     Mobile 12 Daily Itinerary · 날짜별 일정
 *  nearby      Mobile 13 AI Nearby Recommendations · 근처 추천
 *  suggestions Mobile 14 AI Suggestions · 여백에 맞는 장소
 *  review      Mobile 15 Review Change · 추가 결과
 *  connections Mobile 16 Connections · 지금의 인연
 *  gathering   Mobile 17 Dining Gathering / Mobile 18 Sightseeing Gathering
 *  gatheringNew Mobile 18 (두 번째 프레임) 모임 만들기
 *  chat        Mobile 19 Group Chat
 *  profile     Mobile 20 Profile · 나의 수첩
 *  notebook    Mobile 21 Notebook Day
 *  archive     Mobile 22 Archived Conversation
 *  profileEdit Mobile 21 profile 수정 (같은 번호의 두 번째 프레임)
 *  settings    Mobile 22 profile 수정2 · 세부 설정 (같은 번호의 두 번째 프레임)
 *  member      Mobile 20-1 회원 프로필 (모임 대화에서 다른 참여자 닉네임을 눌렀을 때)
 */
export type Route =
  | { name: 'splash'; stay?: boolean }
  | { name: 'onboarding' }
  | { name: 'signup' }
  | { name: 'login'; method?: ContactMethod; contact?: string; notice?: string }
  | { name: 'forgot' }
  | { name: 'checkInbox'; method: ContactMethod; contact: string }
  | { name: 'verify'; purpose: CodePurpose; method: ContactMethod; contact: string }
  | { name: 'newPassword'; method: ContactMethod; contact: string }
  | { name: 'home'; welcome?: 'signup' | 'login' }
  | { name: 'newTrip'; returnTo?: 'itinerary' }
  | { name: 'itinerary'; day?: string }
  | { name: 'schedules' }
  | { name: 'dayPlan'; tripId: string; day?: string }
  | { name: 'nearby'; tripId: string; day: string }
  | { name: 'suggestions'; tripId: string; day: string }
  | { name: 'review'; tripId: string; day: string; activityId: string }
  | { name: 'connections'; assistant?: boolean }
  | { name: 'gathering'; id: string }
  | { name: 'gatheringNew' }
  | { name: 'chat'; id: string }
  | { name: 'profile' }
  | { name: 'notebook'; tripId: string; day?: string }
  | { name: 'archive'; gatheringId: string }
  | { name: 'profileEdit' }
  | { name: 'settings'; section?: 'privacy' | 'color' }
  | { name: 'member'; nickname: string; gatheringId?: string };

interface NavApi {
  route: Route;
  /** 다음 화면으로 이동 (뒤로 가기로 돌아올 수 있음) */
  push: (route: Route) => void;
  /** 현재 화면을 대체 (뒤로 가기 시 현재 화면을 건너뜀) */
  replace: (route: Route) => void;
  /** 기록을 비우고 새 화면에서 시작 (로그인 완료 등) */
  reset: (route: Route) => void;
  /** 기록을 주어진 화면들로 바꾼다 (마지막이 현재 화면). 예: 저장 후 [11 목록, 12 일정] */
  resetTo: (routes: Route[]) => void;
  /** 기록 안에서 조건에 맞는 가장 가까운 이전 화면으로 돌아간다. 없으면 false */
  backTo: (match: (r: Route) => boolean) => boolean;
  /** 브라우저/기기 뒤로 가기와 동일하게 동작 (steps 만큼 이전 화면으로) */
  back: (steps?: number) => void;
  canGoBack: boolean;
}

const NavContext = createContext<NavApi | null>(null);

/** 새로고침해도 여행 화면(08~10)에 그대로 머물도록 화면 기록을 sessionStorage에 보관 */
const STACK_KEY = 'yeobaek.navStack';
const RESTORABLE: Route['name'][] = [
  'home', 'newTrip', 'itinerary', 'schedules', 'dayPlan', 'nearby', 'suggestions', 'review',
  'connections', 'gathering', 'gatheringNew', 'chat', 'profile', 'notebook', 'archive', 'profileEdit', 'settings', 'member',
];
/** 로그인 후 첫 화면이 될 수 있는 화면 (하단 탭의 루트) */
const ROOTS: Route['name'][] = ['home', 'schedules', 'connections', 'profile'];

function readStack(): Route[] | null {
  try {
    const raw = window.sessionStorage.getItem(STACK_KEY);
    const parsed = raw ? (JSON.parse(raw) as Route[]) : null;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    // 로그인 이후 화면만 복원 (인증 화면은 처음부터 다시)
    const start = parsed.findIndex((r) => ROOTS.includes(r.name));
    if (start < 0 || !parsed.slice(start).every((r) => RESTORABLE.includes(r.name))) return null;
    return parsed.slice(start);
  } catch {
    return null;
  }
}

export function NavigationProvider({
  initial,
  restore = false,
  children,
}: {
  initial: Route;
  /** true면 새로고침 직전의 여행 화면 기록을 복원 (로그인 세션이 있을 때만) */
  restore?: boolean;
  children: ReactNode;
}) {
  const [stack, setStack] = useState<Route[]>(() => (restore && readStack()) || [initial]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STACK_KEY, JSON.stringify(stack));
    } catch {
      /* 저장소를 쓸 수 없으면 복원만 건너뜀 */
    }
  }, [stack]);

  useEffect(() => {
    window.history.replaceState({ yeobaekDepth: stackRef.current.length - 1 }, '');
    const onPop = (e: PopStateEvent) => {
      const current = stackRef.current;
      const depth = typeof e.state?.yeobaekDepth === 'number' ? (e.state.yeobaekDepth as number) : 0;
      if (depth < current.length - 1) {
        setStack(current.slice(0, depth + 1));
      } else {
        // 더 돌아갈 화면이 없으면(첫 화면·로그인 완료 후 등) 앱 밖으로 나가지 않도록 기록을 유지
        window.history.pushState({ yeobaekDepth: current.length - 1 }, '');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const push = useCallback((route: Route) => {
    const depth = stackRef.current.length;
    setStack((s) => [...s, route]);
    window.history.pushState({ yeobaekDepth: depth }, '');
  }, []);

  const replace = useCallback((route: Route) => {
    setStack((s) => [...s.slice(0, -1), route]);
  }, []);

  const reset = useCallback((route: Route) => {
    setStack([route]);
    window.history.replaceState({ yeobaekDepth: 0 }, '');
  }, []);

  const resetTo = useCallback((routes: Route[]) => {
    if (routes.length === 0) return;
    setStack(routes);
    // 브라우저 기록 깊이를 새 기록과 맞춘다: 현재 항목을 0으로 두고 나머지를 쌓는다
    window.history.replaceState({ yeobaekDepth: 0 }, '');
    for (let i = 1; i < routes.length; i += 1) window.history.pushState({ yeobaekDepth: i }, '');
  }, []);

  const backTo = useCallback((match: (r: Route) => boolean) => {
    const s = stackRef.current;
    for (let i = s.length - 2; i >= 0; i -= 1) {
      if (match(s[i])) {
        window.history.go(-(s.length - 1 - i));
        return true;
      }
    }
    return false;
  }, []);

  const back = useCallback((steps?: unknown) => {
    // onClick={back} 처럼 이벤트 객체가 넘어와도 1단계 뒤로 가도록 숫자만 인정
    const requested = typeof steps === 'number' ? steps : 1;
    const n = Math.min(requested, stackRef.current.length - 1);
    if (n > 0) window.history.go(-n);
  }, []);

  const value = useMemo<NavApi>(
    () => ({ route: stack[stack.length - 1], push, replace, reset, resetTo, backTo, back, canGoBack: stack.length > 1 }),
    [stack, push, replace, reset, resetTo, backTo, back],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavApi {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used inside NavigationProvider');
  return ctx;
}
