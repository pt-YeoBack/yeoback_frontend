/** Mobile 13·14가 함께 쓰는 추천 상태 (취향, 숨긴 장소, 더 보기, 좋아요 → 일정 추가) */
import { useAppState } from '../lib/appState';
import { useNav } from '../lib/navigation';
import { findGap, NearbyPlace, rankPlaces, slotFor } from '../lib/nearby';
import { newId, sortActivities, useTrips } from '../lib/tripStore';
import { dayKey, useWorld } from '../lib/worldStore';

export const BASE_COUNT = 3;
export const MAX_COUNT = 5;

export function useNearby(tripId: string, day: string) {
  const { getTrip, updateTrip } = useTrips();
  const world = useWorld();
  const { push } = useNav();
  const { showToast } = useAppState();
  const trip = getTrip(tripId);
  const key = dayKey(tripId, day);
  const plan = trip?.days[day] ?? { title: '', activities: [] };
  const activities = sortActivities(plan.activities);
  // 이미 일정에 넣은 추천 장소는 다시 추천하지 않는다
  const added = activities.filter((a) => a.placeId).map((a) => a.placeId as string);
  const dismissed = world.dismissed[key] ?? [];
  const ranked = rankPlaces(world.prefs, [...dismissed, ...added]);
  const expanded = Boolean(world.expanded[key]);
  const visible = ranked.slice(0, expanded ? MAX_COUNT : BASE_COUNT);
  const canExpand = !expanded && ranked.length > BASE_COUNT;
  // AI로 추가한 장소를 빼고 여백을 계산 (추가 후 "남은 여백"이 줄어들도록 추가분 포함)
  const gap = findGap(activities);

  const like = (place: NearbyPlace) => {
    if (!trip) return;
    const slot = slotFor(place, gap);
    const id = newId('act');
    updateTrip(trip.id, (t) => {
      const p = t.days[day] ?? { title: '', activities: [] };
      return {
        ...t,
        days: {
          ...t.days,
          [day]: {
            ...p,
            activities: [
              ...p.activities,
              {
                id,
                time: slot.start,
                place: place.name,
                memo: `${place.category === '공원' ? '산책' : place.category === '카페' ? '휴식' : '체류'} ${place.stay}분 · 좋아요로 추가됨`,
                source: 'ai',
                placeId: place.id,
                note: `도보 예상 ${place.walk}분 · 대중교통 예상 ${place.transit}분`,
              },
            ],
          },
        },
      };
    });
    push({ name: 'review', tripId: trip.id, day, activityId: id });
  };

  const dislike = (place: NearbyPlace) => {
    world.dismissPlace(key, place.id);
    showToast(`${place.shortName}은(는) 추천에서 뺐어요. 일정에는 추가하지 않아요.`);
  };

  return {
    trip,
    plan,
    activities,
    gap,
    visible,
    canExpand,
    expanded,
    dismissedCount: dismissed.length,
    expand: () => world.setExpanded(key, true),
    restore: () => world.restorePlaces(key),
    like,
    dislike,
    prefs: world.prefs,
    setPrefs: world.setPrefs,
  };
}
