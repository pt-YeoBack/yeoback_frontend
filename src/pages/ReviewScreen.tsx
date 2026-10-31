import type { ReactNode } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { RailList } from '../components/WorldParts';
import { ticket } from '../components/icons';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { findPlace, fromMinutes, toMinutes } from '../lib/nearby';
import { Activity, sortActivities, useTrips } from '../lib/tripStore';

/** Mobile 15 Review Change · 좋아요 선택 후 완료 */
export function ReviewScreen({ route }: { route: Extract<Route, { name: 'review' }> }) {
  const { back, backTo, resetTo, canGoBack } = useNav();
  const { showToast } = useAppState();
  const { getTrip, updateTrip } = useTrips();
  const trip = getTrip(route.tripId);
  const plan = trip?.days[route.day];
  const list = sortActivities(plan?.activities ?? []);
  const added = list.find((a) => a.id === route.activityId);
  const place = findPlace(added?.placeId);

  const goPlan = () => {
    if (!backTo((r) => r.name === 'dayPlan' && r.tripId === route.tripId)) {
      resetTo([{ name: 'schedules' }, { name: 'dayPlan', tripId: route.tripId, day: route.day }]);
    }
  };

  const cancel = () => {
    if (!trip || !added) return;
    updateTrip(trip.id, (t) => {
      const p = t.days[route.day];
      return { ...t, days: { ...t.days, [route.day]: { ...p, activities: p.activities.filter((a) => a.id !== added.id) } } };
    });
    showToast(`${added.place} 추가를 취소했어요. 일정은 이전과 같아요.`);
    if (canGoBack) back();
    else goPlan();
  };

  const shell = (children: ReactNode) => (
    <ScreenShell
      frame="Mobile 15 Review Change"
      tone="brand"
      title="일정에 추가했어요"
      onBack={canGoBack ? back : goPlan}
      trailing={<BellButton />}
      contentClassName="review-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      {children}
    </ScreenShell>
  );

  if (!trip || !added) {
    return shell(
      <>
        <p className="empty-day">이 추천은 이미 취소되었거나 찾을 수 없어요.</p>
        <button type="button" className="btn-primary" onClick={goPlan}>
          일정 보기
        </button>
      </>,
    );
  }

  const idx = list.findIndex((a) => a.id === added.id);
  const prev = list.slice(0, idx).filter((a) => a.source !== 'ai').slice(-1)[0];
  const next = list.slice(idx + 1)[0];
  const beforeList = [prev, next].filter(Boolean) as Activity[];
  const afterList = [prev, added, next].filter(Boolean) as Activity[];
  const end = fromMinutes(toMinutes(added.time) + (place?.stay ?? 30));

  return shell(
    <>
      <div>
        <h2 className="review-title">좋아요 선택 후 완료했어요</h2>
        <p className="review-lead">
          {added.time}–{end} · {added.place}이(가) 추가되었어요. 이동 시간과 머무는 시간을 기준으로 정리했어요.
        </p>
      </div>

      <section className="compare-card" aria-label="변경 전">
        <span className="chip chip-soft">변경 전</span>
        {beforeList.length ? (
          <RailList
            compact
            items={beforeList.map((a) => ({ id: a.id, time: a.time, title: a.place, sub: a.memo || '직접 작성한 일정' }))}
          />
        ) : (
          <p className="compare-empty">이 시간대에는 일정이 없었어요.</p>
        )}
      </section>

      <section className="compare-card" aria-label="변경 후">
        <span className="chip chip-solid">변경 후 · 완료</span>
        <RailList
          compact
          items={afterList.map((a) => ({
            id: a.id,
            time: a.time,
            title: a.place,
            sub: a.id === added.id ? '좋아요로 추가됨 · AI 추천' : a.memo || '직접 작성한 일정',
            highlight: a.id === added.id,
          }))}
        />
        {next && (
          <p className="compare-keep">
            {next.time} {next.place}은(는) 바뀌지 않았어요.
          </p>
        )}
      </section>

      <section className="reason-card">
        <h3 className="guidance-title">
          <img src={ticket} alt="" width={19} height={19} />
          이동 시간과 머무는 시간 기준으로 정리했어요
        </h3>
        <p>
          {prev ? `${prev.place} 이후 ` : ''}
          {added.place}까지 도보 {place?.walk ?? '-'}분, 대중교통 {place?.transit ?? '-'}분(예상)으로 계산해 {added.time}–{end}로
          넣었어요.{next ? ` ${next.time} ${next.place}은(는) 그대로 유지했어요.` : ''}
        </p>
      </section>

      <button type="button" className="btn-primary" onClick={goPlan}>
        일정 보기
      </button>
      <button type="button" className="btn-outline btn-outline-strong" onClick={cancel}>
        추가 취소
      </button>
      <p className="footnote center">AI가 제안하고, 여행자가 결정해요. (추천은 데모 데이터예요)</p>
    </>,
  );
}
