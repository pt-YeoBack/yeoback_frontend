import { useEffect, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { chevronUp, mapWhite, pencil, sparkles, trainFront } from '../components/icons';
import { formatMDW, formatShort, ISODate } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { activityPhoto, findPlace, toMinutes, fromMinutes } from '../lib/nearby';
import { sortActivities, tripDates, tripTitle, useTrips } from '../lib/tripStore';
import { DestinationThumb, timezoneLine, tripDateRange } from './tripFormat';
import { DayTabStrip } from '../components/DayTabStrip';
import { RailList } from '../components/WorldParts';

/** Mobile 12 Daily Itinerary · 날짜별 일정 (AI 추천 추가됨) */
export function DayPlanScreen({ route }: { route: Extract<Route, { name: 'dayPlan' }> }) {
  const { push, back, canGoBack, reset, replace } = useNav();
  const { getTrip, editTrip } = useTrips();
  const trip = getTrip(route.tripId);
  const dates = trip ? tripDates(trip) : [];
  const [selected, setSelected] = useState<ISODate | undefined>(route.day);
  const [infoOpen, setInfoOpen] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const day = selected && dates.includes(selected) ? selected : dates[0];

  useEffect(() => {
    if (!trip) reset({ name: 'schedules' });
  }, [trip, reset]);

  useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [day]);

  if (!trip || !day) return null;

  const plan = trip.days[day] ?? { title: '', activities: [] };
  const list = sortActivities(plan.activities);
  const aiPicks = list.filter((a) => a.source === 'ai');
  const dest = trip.destination;

  const selectDay = (d: ISODate) => {
    setSelected(d);
    // 새로고침·뒤로 가기 후에도 같은 날짜를 보도록 화면 기록에 남긴다
    replace({ ...route, day: d });
  };

  const openEditor = () => {
    editTrip(trip.id);
    push({ name: 'itinerary', day });
  };

  const goNearby = () => push({ name: 'nearby', tripId: trip.id, day });

  return (
    <ScreenShell
      frame="Mobile 12 Daily Itinerary"
      tone="brand"
      title={tripTitle(trip)}
      subtitle={`${tripDateRange(trip, '–')} · ${dest?.country ?? '여행지 미정'} · ${1 + trip.companions.length}명`}
      onBack={canGoBack ? back : () => reset({ name: 'schedules' })}
      trailing={<BellButton />}
      contentClassName="dayplan-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <DestinationThumb destination={dest} className="dayplan-hero" />

      <DayTabStrip label="여행 일자" listRef={tabsRef}>
        {dates.map((d, i) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === day}
            aria-controls="dayplan-panel"
            className={`day-tab ${d === day ? 'is-active' : ''}`}
            onClick={() => selectDay(d)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && dates[i + 1]) selectDay(dates[i + 1]);
              if (e.key === 'ArrowLeft' && dates[i - 1]) selectDay(dates[i - 1]);
            }}
          >
            <strong>Day {i + 1}</strong>
            <span>{formatShort(d)}</span>
          </button>
        ))}
      </DayTabStrip>

      <section id="dayplan-panel" role="tabpanel" className="day-panel" aria-label={`${formatMDW(day)} 일정`}>
        <div>
          <div className="section-row">
            <h2 className="dayplan-title">{plan.title || `Day ${dates.indexOf(day) + 1} 일정`}</h2>
            <button type="button" className="icon-button" onClick={openEditor} aria-label="이 날 일정 편집">
              <img src={pencil} alt="" width={18} height={18} />
            </button>
          </div>
          <p className="dayplan-sub">
            {formatMDW(day)} · {timezoneLine(dest)}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="empty-day">
            아직 이 날의 일정이 없어요.
            <br />
            <button type="button" className="link-button" onClick={openEditor}>
              일정 추가하기
            </button>
          </div>
        ) : (
          <RailList
            items={list.map((a) => ({
              id: a.id,
              time: a.time,
              title: a.source === 'ai' ? `${a.place} · AI 추천` : a.place,
              sub: a.memo,
              photo: activityPhoto(a),
              note: a.note,
              highlight: a.source === 'ai',
            }))}
          />
        )}
      </section>

      {list.length >= 2 && (
        <section className={`info-fold ${infoOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="info-fold-head"
            aria-expanded={infoOpen}
            aria-controls="move-memo"
            onClick={() => setInfoOpen((v) => !v)}
          >
            <img src={trainFront} alt="" width={20} height={20} />
            <span>
              {list[0].place} → {list[1].place} · 이동 메모
            </span>
            <img className="info-fold-chevron" src={chevronUp} alt="" width={16} height={16} />
          </button>
          {infoOpen && (
            <div id="move-memo" className="info-fold-body">
              {list.map((a) => (
                <p key={a.id}>
                  <strong>{a.time}</strong> {a.place}
                  {a.memo ? ` · ${a.memo}` : ''}
                  {a.note ? ` (${a.note})` : ''}
                </p>
              ))}
              <p className="info-fold-hint">이동 시간과 체크인 시각은 직접 확인해 주세요. 실제 교통 정보는 연결되어 있지 않아요.</p>
            </div>
          )}
        </section>
      )}

      <button type="button" className="ai-banner" onClick={goNearby}>
        <span className="guidance-title">
          <img src={sparkles} alt="" width={19} height={19} />
          <strong>여행의 여백을 AI가 채워줘요</strong>
        </span>
        <span>
          {aiPicks.length > 0
            ? `좋아요한 장소를 AI 추천으로 추가했어요. ${list.filter((a) => a.source !== 'ai').slice(-1)[0]?.time ?? ''} 약속은 유지해요.`
            : '빈 시간에 들를 만한 근처 장소를 추천받아 보세요.'}
        </span>
      </button>

      {aiPicks.length > 0 && (
        <section className="accepted-card" aria-labelledby="accepted-title">
          <div className="section-row">
            <span className="guidance-title">
              <img src={sparkles} alt="" width={19} height={19} />
              <h2 id="accepted-title">추천받아 수락한 장소</h2>
            </span>
            <span className="chip chip-solid chip-mini">AI 추천</span>
          </div>
          {aiPicks.map((a) => {
            const p = findPlace(a.placeId);
            return (
              <div key={a.id} className="accepted-item">
                {p?.photo && <img src={p.photo} alt="" width={48} height={48} />}
                <div>
                  <strong>{a.place}</strong>
                  <span>
                    {a.time}–{fromMinutes(toMinutes(a.time) + (p?.stay ?? 30))} · {a.memo}
                  </span>
                </div>
              </div>
            );
          })}
          <p className="accepted-note">
            좋아요로 추가됨{aiPicks[0] && findPlace(aiPicks[0].placeId) ? ` · 도보 예상 ${findPlace(aiPicks[0].placeId)?.walk}분 · 대중교통 예상 ${findPlace(aiPicks[0].placeId)?.transit}분` : ''}
          </p>
        </section>
      )}

      <button type="button" className="btn-primary btn-icon" onClick={goNearby}>
        <img src={mapWhite} alt="" width={22} height={22} />
        지도에서 오늘의 동선 보기
      </button>
    </ScreenShell>
  );
}
