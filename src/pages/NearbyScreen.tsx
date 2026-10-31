import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { ChoiceChips, MapStop, MiniMap } from '../components/WorldParts';
import { sparkles, thumbsDown, thumbsUpWhite } from '../components/icons';
import { useAppState } from '../lib/appState';
import { formatMDW } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { formatDuration, isDemoArea, Mood, MOODS, NearbyPlace, PLACE_CATEGORIES, PlaceCategory } from '../lib/nearby';
import { MAX_COUNT, useNearby } from './nearbyShared';

/** 일정 순서 핀 위치 (Figma 지도처럼 남쪽 → 북쪽으로 이어지게, 예시 좌표) */
const STOP_POS: [number, number][] = [
  [44, 86], [70, 66], [80, 30], [40, 34], [22, 58], [56, 14], [30, 12], [62, 50],
];

/** Mobile 13 AI Nearby Recommendations · 좋아요로 일정 추가 */
export function NearbyScreen({ route }: { route: Extract<Route, { name: 'nearby' }> }) {
  const { back, canGoBack, reset, push } = useNav();
  const { showToast } = useAppState();
  const n = useNearby(route.tripId, route.day);
  const [cats, setCats] = useState<PlaceCategory[]>(n.prefs.categories);
  const [mood, setMood] = useState<Mood>(n.prefs.mood);
  const [prefError, setPrefError] = useState('');

  useEffect(() => {
    if (!n.trip) reset({ name: 'schedules' });
  }, [n.trip, reset]);

  if (!n.trip) return null;
  const trip = n.trip;
  const city = trip.destination?.city ?? '여행지';
  const dirty = cats.join() !== n.prefs.categories.join() || mood !== n.prefs.mood;

  const applyPrefs = () => {
    if (cats.length === 0) {
      setPrefError('장소 취향을 1개 이상 골라 주세요.');
      return;
    }
    setPrefError('');
    n.setPrefs({ categories: cats, mood });
    n.restore();
    showToast('고른 취향으로 추천을 다시 정리했어요.');
  };

  const stops: MapStop[] = [
    ...n.activities.slice(0, STOP_POS.length).map((a, i) => ({
      id: a.id,
      x: STOP_POS[i][0],
      y: STOP_POS[i][1],
      label: a.place.length > 9 ? `${a.place.slice(0, 9)}…` : a.place,
      kind: 'stop' as const,
      num: i + 1,
    })),
    ...n.visible.map((p) => ({ id: `pick-${p.id}`, x: p.x, y: p.y, label: p.name, kind: 'pick' as const, num: undefined })),
    { id: 'me', x: 66, y: 46, label: '여백 시작 위치', kind: 'me' as const },
  ];

  return (
    <ScreenShell
      frame="Mobile 13 AI Nearby Recommendations"
      tone="brand"
      title="근처 AI 추천"
      subtitle="좋아요한 장소를 일정에 추가해요"
      onBack={canGoBack ? back : () => reset({ name: 'schedules' })}
      trailing={<BellButton />}
      contentClassName="nearby-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <section className="pref-card" aria-labelledby="pref-title">
        <h2 id="pref-title">취향을 선택해 보세요</h2>
        <p className="pref-help">먼저 3개만 추천해요. 원하면 2개 더, 최대 {MAX_COUNT}개까지.</p>
        <h3>장소</h3>
        <ChoiceChips
          label="장소 취향 (여러 개 선택)"
          options={PLACE_CATEGORIES}
          selected={cats}
          onToggle={(c) => setCats((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]))}
        />
        <h3>분위기</h3>
        <ChoiceChips label="분위기 (하나 선택)" options={MOODS} selected={[mood]} multiple={false} onToggle={(m) => setMood(m)} />
        {prefError && <p className="inline-error" role="alert">{prefError}</p>}
        <button type="button" className="btn-accent" onClick={applyPrefs}>
          {dirty ? '이 취향으로 추천받기' : '이 취향으로 다시 추천받기'}
        </button>
      </section>

      <div>
        <h2 className="nearby-place-title">
          {city} · {formatMDW(route.day)}
        </h2>
        <p className="nearby-place-sub">
          여백 {n.gap.start}–{n.gap.end} · 날씨·현재 위치는 연결 전이라 표시하지 않아요
        </p>
      </div>

      <MiniMap
        stops={stops}
        route
        labels={[
          { x: 6, y: 4, text: isDemoArea(trip) ? '예시 지도' : '우다가와초', tone: 'blue' },
          { x: 62, y: 6, text: '미야시타 공원', tone: 'blue' },
          { x: 78, y: 86, text: '시부야역', tone: 'blue' },
          { x: 4, y: 90, text: '도보 추천 경로' },
        ]}
        onLocate={() => showToast('현재 위치는 위치 권한·지도 API 연결이 필요해요. 지금은 예시 지도예요.')}
        caption="지도 모양 예시 · 실제 지도 아님"
      >
        <button type="button" className="map-detail" onClick={() => push({ name: 'suggestions', tripId: trip.id, day: route.day })}>
          추천 장소 자세히 보기
        </button>
      </MiniMap>

      <section className="gap-card" aria-labelledby="gap-title">
        <h2 id="gap-title" className="guidance-title">
          <img src={sparkles} alt="" width={22} height={22} />
          {formatDuration(n.gap.minutes)}의 여백
        </h2>
        <p>
          {n.gap.before ? `${n.gap.start} (${n.gap.before.place} 이후)` : n.gap.start} → 다음 일정 {n.gap.after ? n.gap.after.time : n.gap.end}
          {n.gap.after && (
            <>
              <br />
              {n.gap.after.place}
            </>
          )}
        </p>
        <p>여백을 채우는 추천 장소를 선택해 보세요.</p>
      </section>

      {isDemoArea(trip) && (
        <p className="demo-note">
          추천 데이터는 Figma의 도쿄 시부야 예시예요. {city} 장소 추천은 실제 AI·장소 API 연결 후 제공돼요.
        </p>
      )}

      {n.visible.length === 0 ? (
        <div className="empty-day">
          추천할 장소를 모두 확인했어요.
          <br />
          <button type="button" className="link-button" onClick={n.restore}>
            숨긴 추천 다시 보기
          </button>
        </div>
      ) : (
        <ul className="rec-list">
          {n.visible.map((p) => (
            <li key={p.id}>
              <RecCard place={p} onLike={() => n.like(p)} onDislike={() => n.dislike(p)} gapStart={n.gap.start} />
            </li>
          ))}
        </ul>
      )}

      {n.canExpand && (
        <button type="button" className="btn-outline" onClick={n.expand}>
          2개 더 보기
        </button>
      )}

      <section className="preview-card" aria-labelledby="preview-title">
        <div className="section-row">
          <h2 id="preview-title">오늘 일정 미리보기</h2>
          <span className="chip chip-soft chip-mini">AI 추천</span>
        </div>
        <ol>
          {n.activities.map((a) => (
            <li key={a.id}>
              <span className="preview-time">{a.time}</span>
              <span>
                <strong>{a.place}</strong>
                <small>{a.source === 'ai' ? 'AI 추천 · 좋아요로 추가됨' : a.memo || '직접 작성한 일정'}</small>
              </span>
            </li>
          ))}
          {n.activities.length === 0 && <li className="preview-empty">아직 이 날의 일정이 없어요.</li>}
        </ol>
      </section>
    </ScreenShell>
  );
}

function RecCard({
  place,
  onLike,
  onDislike,
  gapStart,
}: {
  place: NearbyPlace;
  onLike: () => void;
  onDislike: () => void;
  gapStart: string;
}) {
  return (
    <article className="rec-card" aria-labelledby={`rec-${place.id}`}>
      <div className="section-row rec-head">
        <div>
          <h3>{place.headline}</h3>
          <p>{place.why}</p>
        </div>
        <span className="chip chip-soft chip-mini">AI 추천</span>
      </div>
      <div className="rec-main">
        <span className="rec-cat">{place.category}</span>
        <div>
          <strong id={`rec-${place.id}`}>{place.name}</strong>
          <p>
            도보 약 {place.walk}분 · 대중교통 약 {place.transit}분
            <br />
            {gapStart} 이후 {place.summary}
          </p>
        </div>
      </div>
      <div className="rec-stats">
        <span>
          <small>도보 예상</small>약 {place.walk}분
        </span>
        <span>
          <small>대중교통 예상</small>약 {place.transit}분
        </span>
      </div>
      <div className="vote-row">
        <button type="button" className="btn-vote is-like" onClick={onLike} aria-label={`${place.name} 좋아요 — 일정에 추가`}>
          <img src={thumbsUpWhite} alt="" width={16} height={16} />
          좋아요
        </button>
        <button type="button" className="btn-vote" onClick={onDislike} aria-label={`${place.name} 싫어요 — 추천에서 빼기`}>
          <img src={thumbsDown} alt="" width={16} height={16} />
          싫어요
        </button>
      </div>
    </article>
  );
}
