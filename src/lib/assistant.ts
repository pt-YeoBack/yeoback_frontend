/**
 * Mobile 16 ✦ 버튼 — "여백 도우미" 챗봇 (프론트엔드 데모)
 *
 * ⚠️ 실제 AI(LLM)와 연결되어 있지 않습니다.
 * 질문에 들어 있는 낱말(식사·관광·참여·만들기·안전 등)을 보고,
 * 이 기기에 저장된 모임·여행 데이터로 정해진 형식의 답을 만드는 규칙 기반 응답기입니다.
 * 실제 AI를 붙일 때는 `answer()`를 서버(LLM API) 호출로 바꾸면 화면 코드는 그대로 쓸 수 있습니다.
 */
import { formatMDW } from './dates';
import { findGap, formatDuration } from './nearby';
import { sortActivities, tripDates, Trip } from './tripStore';
import type { AssistantAction, Gathering } from './worldStore';

export interface AssistantContext {
  gatherings: Gathering[];
  isJoined: (id: string) => boolean;
  memberCount: (g: Gathering) => number;
  trip?: Trip;
  nickname: string;
}

export interface AssistantReply {
  text: string;
  actions?: AssistantAction[];
}

/** 처음 열었을 때와 답이 애매할 때 보여 주는 추천 질문 */
export const QUICK_QUESTIONS = [
  '오늘 저녁 같이 먹을 모임 있어?',
  '관광지 모임 알려줘',
  '내 여행이랑 시간이 겹치는 모임은?',
  '모임은 어떻게 만들어?',
  '처음 만나는 사람이라 걱정돼요',
];

const KIND = { dining: '식사', sightseeing: '관광지' } as const;

function line(g: Gathering, ctx: AssistantContext): string {
  const joined = ctx.isJoined(g.id) || g.mine ? ' · 참여 중' : '';
  return `• ${g.title} (${KIND[g.kind]} · ${g.distance})\n  ${formatMDW(g.date)} ${g.start}–${g.end} · ${g.place} · ${ctx.memberCount(g)}/${g.maxPeople}명${joined}`;
}

function openActions(list: Gathering[]): AssistantAction[] {
  return list.slice(0, 3).map((g) => ({ label: `${g.title} 보기`, route: { name: 'gathering', id: g.id } }));
}

function has(q: string, re: RegExp) {
  return re.test(q);
}

export function answer(raw: string, ctx: AssistantContext): AssistantReply {
  const q = raw.replace(/\s+/g, ' ').trim().toLowerCase();
  const open = ctx.gatherings.filter((g) => ctx.memberCount(g) < g.maxPeople || ctx.isJoined(g.id) || g.mine);
  const dates = ctx.trip ? tripDates(ctx.trip) : [];

  if (!q) return { text: '궁금한 내용을 적어 주세요.' };

  // 인사
  if (has(q, /^(안녕|하이|hi|hello|ㅎㅇ)/)) {
    return {
      text: `안녕하세요, ${ctx.nickname}님! 여백 도우미예요.\n지금 볼 수 있는 모임을 찾거나, 모임 만들기·참여 방법, 안전 수칙을 알려 드릴 수 있어요.`,
    };
  }

  // 모임 만들기
  if (has(q, /(만들|개설|열고|열래|모집|주최|호스트)/)) {
    return {
      text: '모임은 이렇게 만들어요.\n1. 제목과 자세한 내용을 적어요.\n2. 식사/관광지, 근처/다른 지역을 하나씩 골라요.\n3. 최대 인원(나 포함 2~6명), 모이는 위치·시간을 정해요.\n만든 모임은 지금은 이 기기에서만 보여요.',
      actions: [{ label: '모임 만들기', route: { name: 'gatheringNew' } }],
    };
  }

  // 안전·개인정보
  if (has(q, /(안전|걱정|무서|개인정보|연락처|실명|신고|차단|위험|불편)/)) {
    return {
      text: '인연에서는 닉네임만 보여요. 실명·연락처는 기본 비공개이고, 직접 동의할 때만 나눠요.\n• 처음엔 사람이 많은 공공장소에서 만나요.\n• 비용은 각자 계산해요.\n• 불편하면 언제든 모임을 나가거나 신고·차단할 수 있어요. (신고는 서버 연결 후 제공)',
      actions: [{ label: '공개 범위 설정', route: { name: 'settings', section: 'privacy' } }],
    };
  }

  // 참여 방법
  if (has(q, /(참여하|참여 방법|가입|들어가|조인|join)/)) {
    return {
      text: '모임 카드를 눌러 상세 화면에서 "이 모임에 참여하기"를 누르면 돼요. 참여하면 모임 대화방에 들어갈 수 있고, 대화는 수첩에 저장돼요.',
      actions: openActions(open.filter((g) => !ctx.isJoined(g.id) && !g.mine)),
    };
  }

  // 시간 겹침 · 내 일정 기준
  if (has(q, /(겹치|시간|일정|여행|날짜|언제)/)) {
    if (!ctx.trip || !dates.length) {
      return {
        text: '저장한 여행이 없어서 시간을 비교할 수 없어요. 여행을 먼저 만들면 겹치는 모임을 찾아 드릴게요.',
        actions: [{ label: '나의 일정', route: { name: 'schedules' } }],
      };
    }
    const inTrip = open.filter((g) => dates.includes(g.date));
    const first = inTrip[0];
    let gapText = '';
    if (first) {
      const plan = ctx.trip.days[first.date];
      const gap = findGap(sortActivities(plan?.activities ?? []));
      gapText = `\n\n그날 내 일정에서 가장 긴 여백은 ${gap.start}–${gap.end} (${formatDuration(gap.minutes)})예요.`;
    }
    return {
      text: inTrip.length
        ? `여행 기간(${formatMDW(dates[0])}–${formatMDW(dates[dates.length - 1])})에 열리는 모임이에요.\n${inTrip.map((g) => line(g, ctx)).join('\n')}${gapText}`
        : '여행 기간에 열리는 모임이 아직 없어요. 직접 모임을 만들어 볼 수도 있어요.',
      actions: inTrip.length ? openActions(inTrip) : [{ label: '모임 만들기', route: { name: 'gatheringNew' } }],
    };
  }

  // 내가 참여한 모임
  if (has(q, /(내가|나의|참여한|참여 ?중인?) ?모임|내 모임/)) {
    const mine = ctx.gatherings.filter((g) => ctx.isJoined(g.id) || g.mine);
    if (!mine.length) return { text: '아직 참여한 모임이 없어요. 식사나 관광지 모임을 찾아 드릴까요?' };
    return {
      text: `참여 중인 모임은 ${mine.length}개예요.\n${mine.map((g) => line(g, ctx)).join('\n')}`,
      actions: mine.slice(0, 3).map((g) => ({ label: `${g.title} 대화`, route: { name: 'chat', id: g.id } })),
    };
  }

  // 식사
  if (has(q, /(식사|밥|먹|저녁|점심|아침밥|맛집|초밥|스시|술|카페)/)) {
    const list = open.filter((g) => g.kind === 'dining');
    return list.length
      ? { text: `함께 식사할 수 있는 모임이에요.\n${list.map((g) => line(g, ctx)).join('\n')}`, actions: openActions(list) }
      : { text: '지금은 식사 모임이 없어요. 직접 만들어 볼까요?', actions: [{ label: '모임 만들기', route: { name: 'gatheringNew' } }] };
  }

  // 관광
  if (has(q, /(관광|산책|구경|명소|사진|아사쿠사|절|사찰|걷)/)) {
    const list = open.filter((g) => g.kind === 'sightseeing');
    return list.length
      ? { text: `함께 둘러볼 수 있는 관광지 모임이에요.\n${list.map((g) => line(g, ctx)).join('\n')}`, actions: openActions(list) }
      : { text: '지금은 관광지 모임이 없어요. 직접 만들어 볼까요?', actions: [{ label: '모임 만들기', route: { name: 'gatheringNew' } }] };
  }

  // 근처 장소 추천은 Mobile 13으로 안내
  if (has(q, /(추천|여백|빈 ?시간|갈 ?만한|어디|장소)/)) {
    const t = ctx.trip;
    return t && t.startDate
      ? {
          text: '빈 시간에 들를 장소는 "근처 AI 추천"에서 취향을 골라 볼 수 있어요. 좋아요를 누르면 일정에 바로 들어가요.',
          actions: [{ label: '근처 추천 보기', route: { name: 'nearby', tripId: t.id, day: t.startDate } }],
        }
      : { text: '여행을 먼저 저장하면 빈 시간에 맞는 근처 장소를 추천해 드려요.', actions: [{ label: '나의 일정', route: { name: 'schedules' } }] };
  }

  // 전체 목록
  if (has(q, /(모임|목록|전체|뭐 있|있어)/)) {
    return {
      text: `지금 볼 수 있는 모임은 ${open.length}개예요.\n${open.map((g) => line(g, ctx)).join('\n')}`,
      actions: openActions(open),
    };
  }

  return {
    text: '아직 이 질문은 이해하지 못했어요. 지금은 데모 도우미라서 모임 찾기·참여·만들기·안전 수칙·시간 겹침 질문에 답할 수 있어요. 아래 추천 질문을 눌러 보세요.',
  };
}
