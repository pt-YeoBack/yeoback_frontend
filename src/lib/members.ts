/**
 * Mobile 20-1 회원 프로필 · 모임 대화에서 다른 참여자 닉네임을 눌렀을 때 보는 프로필
 * 서버가 없어 예시 데이터로 채운다. '느린 발걸음'은 Figma(359:701)에 그려진 내용을 그대로 옮겼고,
 * 나머지 참여자는 같은 형식으로 만든 예시이다(임의 추가). 이 기기의 모임 목록에 함께 있는 모임은
 * 화면에서 실제 모임 정보로 덧붙인다(MemberProfileScreen).
 */
import kyotoPhoto from '../assets/member-kyoto.jpg';
import osakaPhoto from '../assets/member-osaka.jpg';
import sapporoPhoto from '../assets/member-sapporo.jpg';
import cafePhoto from '../assets/notebook-cafe.jpg';
import tokyoPhoto from '../assets/destination-tokyo.jpg';
import jejuPhoto from '../assets/destination-jeju.jpg';
import parkPhoto from '../assets/place-park.jpg';

export interface MemberPost {
  id: string;
  title: string;
  /** 화면에 그대로 보이는 일정 문구 (예: 2026.12.03–12.05 · 2박 3일 · 2명 모집) */
  meta: string;
  status: 'open' | 'closed';
  photo?: string;
  /** 사진을 설명하는 대체 문구 (Figma의 '사진 · …' 자리 표시 문구) */
  photoAlt: string;
}

export interface MemberProfile {
  nickname: string;
  intro: string;
  tastes: string[];
  tasteNote: string;
  written: MemberPost[];
  joined: MemberPost[];
  /** Figma에 그려진 회원이면 true, 같은 형식으로 만든 예시면 false */
  fromFigma: boolean;
}

const PROFILES: MemberProfile[] = [
  {
    nickname: '느린 발걸음',
    intro: '여행의 순간을 천천히 오래 남기는 사람',
    tastes: ['맛집 탐방', '사진 · 산책', '느긋한 일정'],
    tasteNote: '낯선 동네를 걸으며 좋은 식당과 작은 풍경을 찾는 여행을 좋아해요.',
    fromFigma: true,
    written: [
      { id: 'w1', title: '교토의 조용한 찻집을 함께 걸어요', meta: '2026.12.03–12.05 · 2박 3일 · 2명 모집', status: 'open', photo: kyotoPhoto, photoAlt: '교토의 전통 거리 풍경' },
      { id: 'w2', title: '오사카 야시장 한 바퀴', meta: '2026.10.21 · 당일 여행 · 3명', status: 'closed', photo: osakaPhoto, photoAlt: '오사카의 밤거리 풍경' },
    ],
    joined: [
      // Figma 원본 사진이 비어 있어(대체 문구만 있음) 앱에 있는 카페 사진으로 대신함
      { id: 'j1', title: '후쿠오카 빵집과 골목 산책', meta: '2026.12.14–12.16 · 2박 3일 · 1명 모집', status: 'open', photo: cafePhoto, photoAlt: '후쿠오카 골목의 작은 가게' },
      { id: 'j2', title: '삿포로의 첫눈을 만나요', meta: '2026.01.18–01.21 · 3박 4일 · 4명', status: 'closed', photo: sapporoPhoto, photoAlt: '눈 덮인 삿포로 거리 풍경' },
    ],
  },
  {
    nickname: '초밥산책',
    intro: '맛있는 한 끼로 그 도시를 기억해요',
    tastes: ['식도락', '로컬', '가성비'],
    tasteNote: '시장과 오래된 식당을 찾아다니는 걸 좋아해요. 처음 만난 분과도 편하게 먹어요.',
    fromFigma: false,
    written: [],
    joined: [{ id: 'j1', title: '도쿄 야경 산책', meta: '2026.09.03 · 당일 여행 · 5명', status: 'closed', photo: tokyoPhoto, photoAlt: '도쿄 시내 풍경' }],
  },
  {
    nickname: '도쿄한바퀴',
    intro: '지하철 노선도를 외우는 도쿄 덕후',
    tastes: ['쇼핑', '팝업', '활발한'],
    tasteNote: '하루에 동네 세 곳은 돌아야 직성이 풀려요. 걷는 거 좋아하시는 분 환영해요.',
    fromFigma: false,
    written: [],
    joined: [{ id: 'j1', title: '긴자 디저트 투어', meta: '2026.08.17 · 당일 여행 · 3명', status: 'closed', photo: cafePhoto, photoAlt: '디저트 카페' }],
  },
  {
    nickname: '아침빛',
    intro: '해 뜨는 시간에 제일 부지런한 여행자',
    tastes: ['풍경', '사진', '평온한'],
    tasteNote: '사람 없는 아침 거리를 좋아해요. 아침 산책 모임을 자주 열어요.',
    fromFigma: false,
    written: [
      { id: 'w2', title: '제주 해안도로 일출 보기', meta: '2026.06.02 · 당일 여행 · 4명', status: 'closed', photo: jejuPhoto, photoAlt: '제주 바다 풍경' },
    ],
    joined: [],
  },
  {
    nickname: '골목사진가',
    intro: '골목마다 필름 한 장씩 남겨요',
    tastes: ['사진', '로컬', '나홀로'],
    tasteNote: '사진은 꼭 먼저 여쭤보고 찍어요. 조용히 걷는 모임을 좋아해요.',
    fromFigma: false,
    written: [],
    joined: [
      { id: 'j2', title: '요요기 공원 피크닉', meta: '2026.05.10 · 당일 여행 · 6명', status: 'closed', photo: parkPhoto, photoAlt: '공원 풍경' },
    ],
  },
];

/** 예시 데이터가 없는 참여자는 기본 형식으로 보여 준다 */
export function getMemberProfile(nickname: string): MemberProfile {
  return (
    PROFILES.find((p) => p.nickname === nickname) ?? {
      nickname,
      intro: '여백에서 만난 여행자',
      tastes: [],
      tasteNote: '아직 여행 취향을 적지 않았어요.',
      written: [],
      joined: [],
      fromFigma: false,
    }
  );
}
