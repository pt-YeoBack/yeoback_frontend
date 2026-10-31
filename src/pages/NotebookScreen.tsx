import { DayTabStrip } from '../components/DayTabStrip';
import { SafeForm } from '../components/SafeForm';
import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { chevronRight20, circleCheck15, clover, messageWhite, pencil, route as routeIcon } from '../components/icons';
import { useAppState } from '../lib/appState';
import { formatMDW, formatShort, ISODate, todayISO } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { largeActivityPhoto } from '../lib/nearby';
import { sortActivities, tripDates, useTrips } from '../lib/tripStore';
import { useWorld } from '../lib/worldStore';
import { KIND_LABEL } from './ConnectionsScreen';
import { tripStatus, useNotebookStats } from './ProfileScreen';
import { withWhom } from './tripFormat';

/** Mobile 21 Notebook Day · 날짜별 수첩 기록 */
export function NotebookScreen({ route }: { route: Extract<Route, { name: 'notebook' }> }) {
  const { back, canGoBack, reset, replace, push } = useNav();
  const { showToast } = useAppState();
  const { getTrip, updateTrip } = useTrips();
  const world = useWorld();
  const stats = useNotebookStats();
  const trip = getTrip(route.tripId);
  const dates = trip ? tripDates(trip) : [];
  const day = route.day && dates.includes(route.day) ? route.day : dates[0];
  const [editing, setEditing] = useState(false);
  const [diary, setDiary] = useState('');

  useEffect(() => {
    if (!trip) reset({ name: 'profile' });
  }, [trip, reset]);

  useEffect(() => {
    setEditing(false);
  }, [day]);

  if (!trip || !day) return null;

  const plan = trip.days[day] ?? { title: '', activities: [] };
  const list = sortActivities(plan.activities);
  const visited = plan.visited ?? [];
  const photos = [...new Set(list.map(largeActivityPhoto).filter(Boolean))].slice(0, 2) as string[];
  const s = stats(trip);
  const met = s.gatherings.filter((g) => g.date === day);
  const chatG = s.chatGatherings.find((g) => g.date === day);
  const idx = dates.indexOf(day);
  const nextDay = dates[idx + 1];
  const nextPlan = nextDay ? trip.days[nextDay] : undefined;
  const city = trip.destination?.city ?? '여행';

  const selectDay = (d: ISODate) => replace({ ...route, day: d });

  const setPlan = (patch: Partial<typeof plan>) =>
    updateTrip(trip.id, (t) => ({ ...t, days: { ...t.days, [day]: { ...(t.days[day] ?? { title: '', activities: [] }), ...patch } } }));

  const toggleVisit = (id: string) =>
    setPlan({ visited: visited.includes(id) ? visited.filter((x) => x !== id) : [...visited, id] });

  return (
    <ScreenShell
      frame="Mobile 21 Notebook Day"
      tone="brand"
      title={`수첩 · ${city}`}
      subtitle={`${tripStatus(trip)} · ${formatShort(todayISO())}에 다시 펼친 기록`}
      onBack={canGoBack ? back : () => reset({ name: 'profile' })}
      trailing={<BellButton />}
      contentClassName="notebook-content"
      bottomNav={<BottomNav active="profile" />}
    >
      <DayTabStrip label="수첩 기록 날짜">
        {dates.map((d, i) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === day}
            className={`day-tab ${d === day ? 'is-active' : ''}`}
            onClick={() => selectDay(d)}
          >
            <strong>기록 {i + 1}</strong>
            <span>{formatShort(d)}</span>
          </button>
        ))}
      </DayTabStrip>

      <div>
        <h2 className="notebook-title">
          {formatMDW(day)}, {plan.title || `${city}의 ${idx + 1}일차`}
        </h2>
        <p className="dayplan-sub">
          {trip.destination ? `${trip.destination.country} ${trip.destination.city}` : ''} · {withWhom(trip)}
        </p>
      </div>

      {photos.length > 0 && (
        <div className={`notebook-photos count-${photos.length}`}>
          {photos.map((p, i) => (
            <img key={i} src={p} alt="" />
          ))}
        </div>
      )}

      <section className="diary-card" aria-labelledby="diary-title">
        <div className="section-row">
          <h3 id="diary-title">오늘의 한 문장</h3>
          {!editing && (
            <button
              type="button"
              className="icon-button"
              aria-label="오늘의 한 문장 쓰기"
              onClick={() => {
                setDiary(plan.diary ?? '');
                setEditing(true);
              }}
            >
              <img src={pencil} alt="" width={16} height={16} />
            </button>
          )}
        </div>
        {editing ? (
          <SafeForm
            onSubmit={(e) => {
              e.preventDefault();
              setPlan({ diary: diary.trim() });
              setEditing(false);
              showToast('오늘의 한 문장을 수첩에 남겼어요.');
            }}
          >
            <label className="sr-only" htmlFor="diary-input">
              오늘의 한 문장
            </label>
            <textarea id="diary-input" className="soft-input" rows={3} maxLength={120} value={diary} onChange={(e) => setDiary(e.target.value)} autoFocus />
            <div className="activity-editor-actions">
              <button type="button" className="btn-small btn-small-ghost" onClick={() => setEditing(false)}>
                취소
              </button>
              <button type="submit" className="btn-small">
                저장
              </button>
            </div>
          </SafeForm>
        ) : (
          <p>{plan.diary || '아직 남긴 문장이 없어요. 연필을 눌러 이 날을 한 문장으로 적어 보세요.'}</p>
        )}
      </section>

      <section className="visit-card" aria-labelledby="visit-title">
        <h3 id="visit-title">하루의 동선 · 방문 기록</h3>
        {list.length === 0 ? (
          <p className="compare-empty">이 날은 일정이 없었어요.</p>
        ) : (
          <ul>
            {list.map((a) => {
              const on = visited.includes(a.id);
              return (
                <li key={a.id}>
                  <button type="button" role="checkbox" aria-checked={on} className={`visit-row ${on ? 'is-on' : ''}`} onClick={() => toggleVisit(a.id)}>
                    <span className="visit-time">{a.time}</span>
                    <img src={circleCheck15} alt="" width={15} height={15} />
                    <span>{a.place}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="visit-hint">눌러서 다녀온 곳을 체크해요 · {visited.filter((v) => list.some((a) => a.id === v)).length}/{list.length}곳 방문</p>
      </section>

      <section aria-labelledby="met-title">
        <h3 id="met-title" className="guidance-title met-title">
          <img src={clover} alt="" width={20} height={20} />
          인연으로 함께하는 경험
        </h3>
        {met.length === 0 ? (
          <p className="compare-empty">
            이 날 참여한 모임이 없어요.{' '}
            <button type="button" className="link-button" onClick={() => push({ name: 'connections' })}>
              인연 둘러보기
            </button>
          </p>
        ) : (
          <div className="met-grid">
            {met.flatMap((g) =>
              g.members.slice(0, 2).map((m) => (
                <div key={`${g.id}-${m.nickname}`} className="met-card">
                  <strong>{m.nickname}</strong>
                  <span>
                    {m.role ?? '함께한 여행자'} · {KIND_LABEL[g.kind]} 모임
                  </span>
                  <small>
                    {formatShort(g.date)} {g.start} · {g.title}
                  </small>
                </div>
              )),
            )}
          </div>
        )}
      </section>

      {chatG ? (
        <button type="button" className="btn-primary btn-icon" onClick={() => push({ name: 'archive', gatheringId: chatG.id })}>
          <img src={messageWhite} alt="" width={22} height={22} />
          저장된 대화 보기 · {KIND_LABEL[chatG.kind]} 모임
        </button>
      ) : (
        met.length > 0 && (
          <p className="footnote">{world.profile.privacy.autosave ? '이 날 저장된 대화가 없어요.' : '수첩 대화 자동 저장이 꺼져 있어 대화를 보관하지 않았어요.'}</p>
        )
      )}

      {nextDay && (
        <button type="button" className="link-card" onClick={() => selectDay(nextDay)}>
          <img src={routeIcon} alt="" width={20} height={20} />
          <span>
            <strong>
              Day {idx + 2} · {formatMDW(nextDay)} {nextPlan?.title ?? ''}
            </strong>
            <small>
              {nextPlan && nextPlan.activities.length
                ? sortActivities(nextPlan.activities)
                    .slice(0, 3)
                    .map((a) => a.place)
                    .join(' → ')
                : '아직 기록이 없어요'}
            </small>
          </span>
          <img src={chevronRight20} alt="" width={20} height={20} />
        </button>
      )}
    </ScreenShell>
  );
}
