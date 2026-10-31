/**
 * Mobile 13~22 데이터 (프론트엔드 데모)
 * - 프로필·취향·공개 설정, 근처 추천 취향, 인연 모임·참여·대화
 * - localStorage `yeobaek.world.<계정>` 하나에 저장 — 새로고침 후에도 유지
 *
 * ⚠️ 서버가 없어서 다른 여행자는 실제 사람이 아닌 Figma에 그려진 예시 참여자입니다.
 *    모임 참여·대화도 이 브라우저 안에서만 기록되고, 다른 사람에게 전달되지 않습니다.
 */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, ISODate } from './dates';
import { DEFAULT_PREFS, NearbyPrefs } from './nearby';
import { newId } from './tripStore';

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------

export interface Profile {
  nickname: string;
  intro: string;
  /** 'initial' = 닉네임 첫 글자, 'puppy' = Figma 예시 캐릭터, 그 외 data URL(직접 올린 사진) */
  avatar: string;
  tastes: string[];
  keywords: string[];
  privacy: { nickname: boolean; contact: boolean; autosave: boolean };
  /** Mobile 22 컬러 조합 선택: 팔레트 id(lib/accent.ts) 또는 직접 고른 #rrggbb */
  accent?: string;
}

export type GatheringKind = 'dining' | 'sightseeing';

export interface Member {
  nickname: string;
  role?: string; // '모임장' 등
  icon?: 'sun' | 'camera' | 'cloud' | 'footprints' | 'heart';
}

export interface Gathering {
  id: string;
  kind: GatheringKind;
  /** "근처" / "다른 지역" */
  distance: '근처' | '다른 지역';
  title: string;
  description: string;
  date: ISODate;
  start: string;
  end: string;
  place: string;
  placeDetail: string;
  meetNote: string;
  extraNote?: string;
  maxPeople: number;
  members: Member[];
  photo?: string; // 'sushi' | 'asakusa' | data URL
  /** Figma에 그려진 예시 모임이면 true */
  sample?: boolean;
  /** 내가 만든 모임이면 true (내가 모임장) */
  mine?: boolean;
  /** 지도 위 위치 (0~100 %) */
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  author: string; // 닉네임, 나는 '__me'
  role?: string;
  text: string;
  time: string; // HH:MM
}

interface WorldData {
  profile: Profile;
  prefs: NearbyPrefs;
  /** 추천 화면에서 싫어요로 숨긴 장소 (여행·날짜별) */
  dismissed: Record<string, string[]>;
  /** "2개 더 보기"를 누른 여행·날짜 */
  expanded: Record<string, boolean>;
  createdGatherings: Gathering[];
  joined: string[];
  chats: Record<string, ChatMessage[]>;
  /** 대화 기록을 직접 지운 모임 */
  archiveDeleted: string[];
  /** Mobile 16 ✦ 버튼 — 여백 도우미(챗봇 데모) 대화 기록 */
  assistantLog: AssistantMessage[];
  /** Mobile 20-1 친구 신청(테스트) — 이 기기에만 기록, 상대에게 전달되지 않음 */
  friendRequests: string[];
}

export interface AssistantAction {
  label: string;
  /** 누르면 이동할 화면 (navigation Route와 같은 모양) */
  route: { name: string; [k: string]: unknown };
}

export interface AssistantMessage {
  id: string;
  from: 'me' | 'bot';
  text: string;
  time: string;
  actions?: AssistantAction[];
}

// ---------------------------------------------------------------------------
// Figma 예시 모임 (Mobile 16~19 · 21 · 22)
// ---------------------------------------------------------------------------

/** 예시 모임 날짜는 첫 여행의 1·2일차에 맞춘다 (여행이 없으면 Figma 날짜 2026-11-09) */
export function sampleGatherings(baseDate: ISODate | null): Gathering[] {
  const d1 = baseDate ?? '2026-11-09';
  return [
    {
      id: 'sample-sushi',
      kind: 'dining',
      distance: '근처',
      title: '시부야에서 초밥 한 끼',
      description: '오늘 저녁, 각자의 여행 이야기를 나눠요.',
      date: d1,
      start: '19:00',
      end: '20:00',
      place: '우오베이 시부야 도겐자카점',
      placeDetail: '2-29-11 도겐자카 · 도보 약 10분',
      meetNote: '18:50 식당 입구에서 만나요.',
      extraNote: '사용자 고정 저녁 약속 · 식당 예약 확약 아님\n식당 입구에서 함께 만나요.',
      maxPeople: 6,
      members: [
        { nickname: '초밥산책', role: '모임장' },
        { nickname: '도쿄한바퀴' },
        { nickname: '느린 발걸음' },
      ],
      photo: 'sushi',
      sample: true,
      x: 26,
      y: 52,
    },
    {
      id: 'sample-asakusa',
      kind: 'sightseeing',
      distance: '다른 지역',
      title: '아사쿠사 아침 산책',
      description: '사람이 적은 아침, 천천히 걸어요.',
      date: addDays(d1, 1),
      start: '09:00',
      end: '10:00',
      place: '가미나리몬 앞',
      placeDetail: '시부야에서 지하철 약 40분',
      meetNote: '08:50 가미나리몬 앞에서 만나요.',
      maxPeople: 6,
      members: [
        { nickname: '아침빛', role: '모임장', icon: 'sun' },
        { nickname: '골목사진가', icon: 'camera' },
        { nickname: '구름여행', icon: 'cloud' },
        { nickname: '느린 발걸음', icon: 'heart' },
      ],
      photo: 'asakusa',
      sample: true,
      x: 60,
      y: 14,
    },
    // Figma에는 카드가 2장뿐이라, 같은 템플릿으로 예시 모임 2개를 더 넣었습니다 (임의 추가)
    {
      id: 'sample-cafe',
      kind: 'dining',
      distance: '근처',
      title: '시부야 골목 카페 한 잔',
      description: '오후의 여백에 조용한 카페에서 쉬어 가요.',
      date: addDays(d1, 2),
      start: '15:00',
      end: '16:00',
      place: '시부야 오쿠시부 카페 거리',
      placeDetail: '시부야역에서 도보 약 12분',
      meetNote: '14:50 카페 거리 입구에서 만나요.',
      extraNote: '각자 주문 · 예약 없음\n자리가 없으면 근처 카페로 옮겨요.',
      maxPeople: 4,
      members: [
        { nickname: '라테한모금', role: '모임장' },
        { nickname: '오후산책' },
      ],
      photo: 'cafe',
      sample: true,
      x: 18,
      y: 30,
    },
    {
      id: 'sample-skytree',
      kind: 'sightseeing',
      distance: '다른 지역',
      title: '스미다강 스카이트리 노을 산책',
      description: '강을 따라 걸으며 노을과 스카이트리를 봐요.',
      date: addDays(d1, 3),
      start: '17:00',
      end: '18:30',
      place: '아사쿠사역 4번 출구',
      placeDetail: '시부야에서 지하철 약 35분',
      meetNote: '16:50 아사쿠사역 4번 출구에서 만나요.',
      maxPeople: 6,
      members: [
        { nickname: '노을수집가', role: '모임장', icon: 'sun' },
        { nickname: '강변러너', icon: 'footprints' },
        { nickname: '필름한롤', icon: 'camera' },
      ],
      photo: 'tokyo',
      sample: true,
      x: 50,
      y: 82,
    },
  ];
}

/** Figma Mobile 19의 대화 (예시 참여자 메시지) */
const SAMPLE_CHATS: Record<string, ChatMessage[]> = {
  'sample-sushi': [
    { id: 's1', author: '초밥산책', role: '모임장', text: '안녕하세요!\n저녁 7시 쯤 우오베이 도겐자카점 입구에서 만나요.', time: '18:12' },
    { id: 's2', author: '도쿄한바퀴', text: '저도 근처예요. 입구에서 같이 만나요.', time: '18:16' },
    { id: 's3', author: '느린 발걸음', text: '반가워요! 식사 비용은 각자 주문한 만큼 계산하면 될까요?', time: '18:18' },
    { id: 's4', author: '초밥산책', role: '모임장', text: '네, 각자 계산해요. 천천히 오세요!', time: '18:19' },
  ],
  'sample-asakusa': [
    { id: 'a1', author: '아침빛', role: '모임장', text: '안녕하세요! 내일 08:50에 가미나리몬 앞에서 만나요.', time: '21:02' },
    { id: 'a2', author: '골목사진가', text: '사진 찍을 때는 먼저 물어볼게요!', time: '21:05' },
  ],
};

export const TASTE_OPTIONS = [
  '힐링', '풍경', '식도락', '디저트', '물멍', '로컬', '카페', '쇼핑', '휴양', '캠핑', '축제', '가성비',
  '어드벤처', '팝업', '공연', '호캉스', '자연', '사진', '기념품', '숙소', '가족', '커플', '친구', '나홀로',
];

export const KEYWORD_OPTIONS = [
  '평온한', '계획적인', '평화로운', '활발한', '여유로운', '재밌는', '무계획의', '회복되는', '조용한',
  '나즈막한', '체계적인', '가벼운', '로컬적인', '활기찬', '체험하는',
];

function defaultWorld(): WorldData {
  return {
    profile: {
      nickname: '파란여백',
      intro: '서두르지 않고 오래 기억하는 여행',
      avatar: 'initial',
      // Figma Mobile 22(세부 설정)에서 선택된 칩
      tastes: ['힐링', '카페', '쇼핑', '친구'],
      keywords: ['여유로운', '조용한', '가벼운'],
      privacy: { nickname: true, contact: false, autosave: true },
      accent: 'sky',
    },
    prefs: DEFAULT_PREFS,
    dismissed: {},
    expanded: {},
    createdGatherings: [],
    joined: [],
    chats: {},
    archiveDeleted: [],
    assistantLog: [],
    friendRequests: [],
  };
}

function read(key: string): WorldData {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultWorld();
    const parsed = JSON.parse(raw) as Partial<WorldData>;
    const base = defaultWorld();
    return { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile, privacy: { ...base.profile.privacy, ...parsed.profile?.privacy } } };
  } catch {
    return defaultWorld();
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface WorldApi extends WorldData {
  gatherings: Gathering[];
  getGathering: (id: string) => Gathering | undefined;
  isJoined: (id: string) => boolean;
  /** 화면에 보여 줄 참여 인원 (예시 참여자 + 나) */
  memberCount: (g: Gathering) => number;
  messagesOf: (id: string) => ChatMessage[];
  updateProfile: (patch: Partial<Profile>) => void;
  setPrefs: (p: NearbyPrefs) => void;
  dismissPlace: (key: string, placeId: string) => void;
  restorePlaces: (key: string) => void;
  setExpanded: (key: string, v: boolean) => void;
  join: (id: string) => void;
  leave: (id: string) => void;
  createGathering: (g: Omit<Gathering, 'id' | 'members' | 'mine' | 'x' | 'y'>) => Gathering;
  sendMessage: (id: string, text: string) => void;
  deleteArchive: (id: string) => void;
  addAssistant: (msgs: AssistantMessage[]) => void;
  clearAssistant: () => void;
  toggleFriendRequest: (nickname: string) => boolean;
}

const WorldContext = createContext<WorldApi | null>(null);

export function WorldProvider({
  owner,
  baseDate,
  children,
}: {
  owner: string | null;
  /** 예시 모임 날짜 기준 (첫 여행 시작일) */
  baseDate: ISODate | null;
  children: ReactNode;
}) {
  const key = `yeobaek.world.${owner ?? 'guest'}`;
  const [data, setData] = useState<WorldData>(() => read(key));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* 저장소를 쓸 수 없으면 메모리에서만 유지 */
    }
  }, [key, data]);

  const gatherings = useMemo(
    () => [...data.createdGatherings, ...sampleGatherings(baseDate)],
    [data.createdGatherings, baseDate],
  );

  const getGathering = useCallback((id: string) => gatherings.find((g) => g.id === id), [gatherings]);
  const isJoined = useCallback((id: string) => data.joined.includes(id), [data.joined]);
  const memberCount = useCallback(
    (g: Gathering) => g.members.length + (data.joined.includes(g.id) && !g.mine ? 1 : 0) + (g.mine ? 1 : 0),
    [data.joined],
  );
  const messagesOf = useCallback(
    (id: string) => [...(SAMPLE_CHATS[id] ?? []), ...(data.chats[id] ?? [])],
    [data.chats],
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
    [],
  );
  const setPrefs = useCallback((prefs: NearbyPrefs) => setData((d) => ({ ...d, prefs })), []);
  const dismissPlace = useCallback(
    (k: string, placeId: string) =>
      setData((d) => ({ ...d, dismissed: { ...d.dismissed, [k]: [...(d.dismissed[k] ?? []), placeId] } })),
    [],
  );
  const restorePlaces = useCallback((k: string) => setData((d) => ({ ...d, dismissed: { ...d.dismissed, [k]: [] } })), []);
  const setExpanded = useCallback(
    (k: string, v: boolean) => setData((d) => ({ ...d, expanded: { ...d.expanded, [k]: v } })),
    [],
  );
  const join = useCallback(
    (id: string) => setData((d) => (d.joined.includes(id) ? d : { ...d, joined: [...d.joined, id] })),
    [],
  );
  const leave = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        joined: d.joined.filter((x) => x !== id),
        createdGatherings: d.createdGatherings.filter((g) => g.id !== id),
      })),
    [],
  );
  const createGathering = useCallback((g: Omit<Gathering, 'id' | 'members' | 'mine' | 'x' | 'y'>) => {
    const created: Gathering = {
      ...g,
      id: newId('gather'),
      members: [],
      mine: true,
      x: 35 + Math.round(Math.random() * 30),
      y: 30 + Math.round(Math.random() * 40),
    };
    setData((d) => ({ ...d, createdGatherings: [created, ...d.createdGatherings], joined: [...d.joined, created.id] }));
    return created;
  }, []);
  const sendMessage = useCallback((id: string, text: string) => {
    const now = new Date();
    const msg: ChatMessage = {
      id: newId('msg'),
      author: '__me',
      text,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
    setData((d) => ({
      ...d,
      chats: { ...d.chats, [id]: [...(d.chats[id] ?? []), msg] },
      archiveDeleted: d.archiveDeleted.filter((x) => x !== id),
    }));
  }, []);
  const deleteArchive = useCallback(
    (id: string) => setData((d) => ({ ...d, archiveDeleted: [...new Set([...d.archiveDeleted, id])] })),
    [],
  );

  const addAssistant = useCallback(
    (msgs: AssistantMessage[]) => setData((d) => ({ ...d, assistantLog: [...d.assistantLog, ...msgs].slice(-60) })),
    [],
  );
  const clearAssistant = useCallback(() => setData((d) => ({ ...d, assistantLog: [] })), []);
  /** 신청 상태를 바꾸고, 바뀐 뒤 신청 중이면 true */
  const toggleFriendRequest = useCallback(
    (nickname: string) => {
      const on = !data.friendRequests.includes(nickname);
      setData((d) => ({
        ...d,
        friendRequests: on ? [...new Set([...d.friendRequests, nickname])] : d.friendRequests.filter((n) => n !== nickname),
      }));
      return on;
    },
    [data.friendRequests],
  );

  const value = useMemo<WorldApi>(
    () => ({
      ...data,
      gatherings,
      getGathering,
      isJoined,
      memberCount,
      messagesOf,
      updateProfile,
      setPrefs,
      dismissPlace,
      restorePlaces,
      setExpanded,
      join,
      leave,
      createGathering,
      sendMessage,
      deleteArchive,
      addAssistant,
      clearAssistant,
      toggleFriendRequest,
    }),
    [data, gatherings, getGathering, isJoined, memberCount, messagesOf, updateProfile, setPrefs, dismissPlace, restorePlaces, setExpanded, join, leave, createGathering, sendMessage, deleteArchive, addAssistant, clearAssistant, toggleFriendRequest],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldApi {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error('useWorld must be used inside WorldProvider');
  return ctx;
}

/** 추천 상태를 여행·날짜별로 나누는 키 */
export function dayKey(tripId: string, day: string) {
  return `${tripId}:${day}`;
}
