/**
 * Mobile 12~15 "근처 AI 추천" 데모 데이터와 여백(빈 시간) 계산
 *
 * ⚠️ 실제 AI·지도·장소 API는 연결되어 있지 않습니다.
 * Figma에 그려진 시부야 추천 3곳(+ 더 보기 2곳)을 고정 목록으로 두고,
 * 사용자가 고른 취향(장소·분위기)으로 걸러서 보여 주는 프론트엔드 데모입니다.
 */
import parkPhoto from '../assets/place-park.jpg';
import tsutayaPhoto from '../assets/place-tsutaya.jpg';
import donutPhoto from '../assets/place-donut.jpg';
import naritaPhoto from '../assets/thumb-narita.jpg';
import hotelPhoto from '../assets/thumb-hotel.jpg';
import shopPhoto from '../assets/thumb-shop.jpg';
import cafePhoto from '../assets/notebook-cafe.jpg';
import sushiPhoto from '../assets/gathering-sushi.jpg';
import type { Activity, Trip } from './tripStore';
import { sortActivities } from './tripStore';

export type PlaceCategory = '공원' | '카페' | '미술관' | '맛집';
export type Mood = '한적한 곳' | '사람 많은 곳';

export const PLACE_CATEGORIES: PlaceCategory[] = ['공원', '카페', '미술관', '맛집'];
export const MOODS: Mood[] = ['한적한 곳', '사람 많은 곳'];

export interface NearbyPlace {
  id: string;
  category: PlaceCategory;
  mood: Mood;
  /** Mobile 13 카드 제목 */
  name: string;
  /** Mobile 14 카드 제목 (Figma에서 표기가 조금 다름) */
  shortName: string;
  photo?: string;
  walk: number; // 분
  transit: number; // 분
  stay: number; // 분
  headline: string; // "근처에 공원이 있어요"
  why: string; // "산책하기 좋은 장소로 여백을 채우기 좋아요"
  summary: string; // Mobile 13 카드 두 번째 줄
  tag: string; // Mobile 14 "휴식공간 · 짧은 산책하기 좋아요"
  reason: string; // Mobile 14 본문
  /** 지도 위 위치 (0~100 %) */
  x: number;
  y: number;
  /** Figma에 그려진 추천 장소 (그 외는 "2개 더 보기"용 예시) */
  featured?: boolean;
}

/** Figma Mobile 13·14의 추천 3곳 + "2개 더 보기"용 예시 2곳(임의 추가) */
export const NEARBY_PLACES: NearbyPlace[] = [
  {
    id: 'miyashita',
    featured: true,
    category: '공원',
    mood: '한적한 곳',
    name: '미야시타 공원',
    shortName: '미야시타공원',
    photo: parkPhoto,
    walk: 9,
    transit: 12,
    stay: 30,
    headline: '근처에 공원이 있어요',
    why: '산책하기 좋은 장소로 여백을 채우기 좋아요',
    summary: '산책 코스로 추천해요.',
    tag: '휴식공간 · 짧은 산책하기 좋아요',
    reason: '짧은 산책을 원한다면 공원도 좋은 선택이에요. 이동 시간도 비교적 짧아요.',
    x: 74,
    y: 26,
  },
  {
    id: 'tsutaya',
    featured: true,
    category: '카페',
    mood: '한적한 곳',
    name: 'TSUTAYA의 카페',
    shortName: 'TSUTAYA 카페',
    photo: tsutayaPhoto,
    walk: 5,
    transit: 10,
    stay: 40,
    headline: '근처에 카페가 있어요',
    why: '실내 휴식하기 좋은 장소로 여백을 채우기 좋아요',
    summary: '저녁 전 실내에서 40분 쉬어가요.',
    tag: '실내 휴식 · 책과 디자인을 천천히 둘러볼 수 있어요',
    reason: '실내에서 책과 디자인을 천천히 둘러봐요. 이동이 짧고 저녁 전 여유도 남아요.',
    x: 52,
    y: 62,
  },
  {
    id: 'donut',
    featured: true,
    category: '맛집',
    mood: '사람 많은 곳',
    name: "I'm donut? 시부야점",
    shortName: "I'm donut? 시부야",
    photo: donutPhoto,
    walk: 8,
    transit: 12,
    stay: 20,
    headline: '근처에 맛집이 있어요',
    why: '간단한 간식으로 여백을 채우기 좋아요',
    summary: '간단한 간식으로 여백을 채우기 좋아요.',
    tag: '간식 · 짧은 이동과 짧은 체류로 여유를 남길 수 있어요',
    reason: '간단한 간식 시간을 원한다면 이곳도 좋은 선택이에요. 이동 시간도 짧고 체류 시간도 짧아요.',
    x: 30,
    y: 70,
  },
  {
    id: 'museum',
    category: '미술관',
    mood: '사람 많은 곳',
    name: '시부야 작은 갤러리 (예시)',
    shortName: '작은 갤러리 (예시)',
    walk: 11,
    transit: 9,
    stay: 40,
    headline: '근처에 미술관이 있어요',
    why: '조용히 둘러보며 여백을 채우기 좋아요',
    summary: '전시를 천천히 보고 저녁 전에 돌아와요.',
    tag: '전시 · 조용히 둘러보기 좋아요',
    reason: 'Figma에 없는 예시 장소예요. 실제 운영 여부와 위치는 장소 API 연결 후 확인해야 해요.',
    x: 18,
    y: 34,
  },
  {
    id: 'scramble',
    category: '카페',
    mood: '사람 많은 곳',
    name: '스크램블 교차로 전망 카페 (예시)',
    shortName: '전망 카페 (예시)',
    walk: 4,
    transit: 6,
    stay: 30,
    headline: '근처에 전망 좋은 카페가 있어요',
    why: '활기찬 풍경을 보며 쉬어 가기 좋아요',
    summary: '교차로를 내려다보며 30분 쉬어가요.',
    tag: '전망 · 사람 구경하기 좋아요',
    reason: 'Figma에 없는 예시 장소예요. 실제 운영 여부와 위치는 장소 API 연결 후 확인해야 해요.',
    x: 62,
    y: 80,
  },
];

export function findPlace(id: string | undefined): NearbyPlace | undefined {
  return NEARBY_PLACES.find((p) => p.id === id);
}

/** 활동 이름으로 Figma 썸네일을 찾아 붙인다 (Mobile 12 카드 왼쪽 사진) */
export function activityPhoto(a: Activity): string | undefined {
  if (a.placeId) return findPlace(a.placeId)?.photo;
  const n = a.place.toLowerCase();
  if (/narita|나리타|공항|airport/.test(n)) return naritaPhoto;
  if (/호텔|hotel|숙소|체크인/.test(n)) return hotelPhoto;
  if (/cafe|카페|coffee|커피/.test(n)) return cafePhoto;
  if (/shop|쇼핑|센터가이/.test(n)) return shopPhoto;
  if (/초밥|스시|우오베이|dinner|저녁|식당/.test(n)) return sushiPhoto;
  return undefined;
}

/** 크게 보여 줘도 선명한 사진만 (Mobile 21 수첩 사진 칸) */
export function largeActivityPhoto(a: Activity): string | undefined {
  const p = activityPhoto(a);
  return p && [cafePhoto, sushiPhoto, parkPhoto, tsutayaPhoto, donutPhoto].includes(p) ? p : undefined;
}

// ---------------------------------------------------------------------------
// 여백(빈 시간) 계산
// ---------------------------------------------------------------------------

export function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(min: number): string {
  const v = Math.max(0, Math.min(min, 23 * 60 + 59));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export interface Gap {
  start: string;
  end: string;
  minutes: number;
  before?: Activity;
  after?: Activity;
}

/**
 * 하루 일정에서 가장 긴 빈 시간을 찾는다.
 * 활동마다 머무는 시간 정보가 없어 "앞 활동 시작 + 10분 ~ 다음 활동 시작"을 여백으로 본다 (임시 규칙).
 * 일정이 1개 이하이면 마지막 활동 이후 2시간(없으면 14:00~16:00)을 여백으로 둔다.
 */
export function findGap(activities: Activity[]): Gap {
  const list = sortActivities(activities);
  let best: Gap | null = null;
  for (let i = 0; i < list.length - 1; i += 1) {
    const s = toMinutes(list[i].time) + 10;
    const e = toMinutes(list[i + 1].time);
    if (e - s >= 30 && (!best || e - s > best.minutes)) {
      best = { start: fromMinutes(s), end: fromMinutes(e), minutes: e - s, before: list[i], after: list[i + 1] };
    }
  }
  if (best) return best;
  const last = list[list.length - 1];
  const s = last ? toMinutes(last.time) + 10 : 14 * 60;
  const e = Math.min(s + 120, 23 * 60);
  return { start: fromMinutes(s), end: fromMinutes(e), minutes: e - s, before: last };
}

/** 추천 장소를 여백에 넣을 때의 시작·끝 시각 (여백 시작 + 도보 시간, 10분 단위 올림) */
export function slotFor(place: NearbyPlace, gap: Gap): { start: string; end: string; fits: boolean } {
  const s = Math.ceil((toMinutes(gap.start) + place.walk) / 10) * 10;
  const e = s + place.stay;
  return { start: fromMinutes(s), end: fromMinutes(e), fits: e + place.walk <= toMinutes(gap.end) };
}

export interface NearbyPrefs {
  categories: PlaceCategory[];
  mood: Mood;
}

export const DEFAULT_PREFS: NearbyPrefs = { categories: ['공원', '카페', '미술관'], mood: '한적한 곳' };

/**
 * 취향에 맞는 순서로 추천 목록을 만든다. 맞는 곳이 부족하면 나머지로 채운다 (최대 5곳).
 * - 기본 취향(Figma Mobile 13 그대로)일 때는 Figma에 그려진 3곳(미야시타 공원·TSUTAYA·I'm donut?)을 먼저 보여 준다.
 * - 취향을 바꾸면 장소 일치 2점 + 분위기 일치 1점으로 다시 정렬한다 (동점이면 Figma 장소 우선).
 */
export function rankPlaces(prefs: NearbyPrefs, exclude: string[] = []): NearbyPlace[] {
  const isDefault =
    prefs.mood === DEFAULT_PREFS.mood &&
    prefs.categories.length === DEFAULT_PREFS.categories.length &&
    DEFAULT_PREFS.categories.every((c) => prefs.categories.includes(c));
  const score = (p: NearbyPlace) =>
    isDefault
      ? (p.featured ? 10 : 0)
      : (prefs.categories.includes(p.category) ? 2 : 0) + (p.mood === prefs.mood ? 1 : 0) + (p.featured ? 0.5 : 0);
  return NEARBY_PLACES.filter((p) => !exclude.includes(p.id))
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.p);
}

/** 여행지가 도쿄가 아니면 추천 데이터가 시부야 예시라는 점을 알려 준다 */
export function isDemoArea(trip: Trip): boolean {
  return trip.destination?.id !== 'tokyo';
}
