/**
 * 여행지 목록 (프론트엔드 데모용)
 * Figma Mobile 09에는 "도쿄 · 일본"만 그려져 있어, 선택 흐름을 확인할 수 있도록
 * 대표 여행지를 임의로 추가했습니다. 실제 서비스에서는 장소 검색 API로 교체하세요.
 */
import tokyoPhoto from '../assets/destination-tokyo.jpg';

export type Region = 'domestic' | 'overseas';

export interface Destination {
  id: string;
  region: Region;
  city: string;
  country: string;
  tagline: string;
  /** Figma에서 내보낸 사진은 도쿄뿐이라 나머지는 색 배경으로 표시 */
  photo?: string;
  tint: [string, string];
}

export const DESTINATIONS: Destination[] = [
  { id: 'tokyo', region: 'overseas', city: '도쿄', country: '일본', tagline: '맛집, 카페와 풍경을 천천히', photo: tokyoPhoto, tint: ['#7fb1e6', '#244790'] },
  { id: 'osaka', region: 'overseas', city: '오사카', country: '일본', tagline: '골목 노포와 강변 산책', tint: ['#f2b07e', '#c2552f'] },
  { id: 'fukuoka', region: 'overseas', city: '후쿠오카', country: '일본', tagline: '가볍게 떠나는 주말 미식', tint: ['#9fd1c7', '#2f7f75'] },
  { id: 'taipei', region: 'overseas', city: '타이베이', country: '대만', tagline: '야시장과 차 한 잔의 여유', tint: ['#f4c26b', '#b0721c'] },
  { id: 'danang', region: 'overseas', city: '다낭', country: '베트남', tagline: '바다 앞에서 쉬어 가기', tint: ['#86d3e8', '#1f7ea1'] },
  { id: 'bangkok', region: 'overseas', city: '방콕', country: '태국', tagline: '사원과 강, 밤의 루프탑', tint: ['#e9a6c7', '#9c3f6f'] },
  { id: 'paris', region: 'overseas', city: '파리', country: '프랑스', tagline: '미술관과 오래 걷는 저녁', tint: ['#b3b8f0', '#4c55b6'] },
  { id: 'jeju', region: 'domestic', city: '제주', country: '대한민국', tagline: '오름과 바다를 내 속도로', tint: ['#8fd3a9', '#2e8a55'] },
  { id: 'busan', region: 'domestic', city: '부산', country: '대한민국', tagline: '해변 카페와 골목 시장', tint: ['#88b9f0', '#2c62a8'] },
  { id: 'gangneung', region: 'domestic', city: '강릉', country: '대한민국', tagline: '커피 거리와 동해 일출', tint: ['#a5c8e8', '#3b6f9c'] },
  { id: 'gyeongju', region: 'domestic', city: '경주', country: '대한민국', tagline: '천년 고도의 느린 산책', tint: ['#e3c18f', '#8d6326'] },
  { id: 'yeosu', region: 'domestic', city: '여수', country: '대한민국', tagline: '밤바다와 섬 여행', tint: ['#93c6e0', '#245f86'] },
];

export const DEPARTURE_COUNTRIES = ['대한민국', '일본', '미국', '중국', '대만', '기타'];

export const RELATIONS = ['선택 안 함', '친구', '가족', '연인', '동료', '기타'];

export function findDestination(id: string | null | undefined): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

/** 목록에 없는 곳을 직접 입력했을 때 */
export function customDestination(name: string, region: Region): Destination {
  const city = name.trim();
  return {
    id: `custom:${city}`,
    region,
    city,
    country: region === 'domestic' ? '대한민국' : '직접 입력',
    tagline: '직접 입력한 여행지',
    tint: ['#b9cdee', '#244790'],
  };
}
