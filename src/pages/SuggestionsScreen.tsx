import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { sparkles, thumbsDown, thumbsUpWhite } from '../components/icons';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { formatDuration, NearbyPlace } from '../lib/nearby';
import { MAX_COUNT, useNearby } from './nearbyShared';

/** Mobile 14 AI Suggestions · 가까운 발견 (여백에 맞는 장소) */
export function SuggestionsScreen({ route }: { route: Extract<Route, { name: 'suggestions' }> }) {
  const { back, canGoBack, reset, push, backTo } = useNav();
  const { showToast } = useAppState();
  const n = useNearby(route.tripId, route.day);
  const [asking, setAsking] = useState<string | null>(null);

  useEffect(() => {
    if (!n.trip) reset({ name: 'schedules' });
  }, [n.trip, reset]);

  if (!n.trip) return null;

  const changePrefs = () => {
    if (!backTo((r) => r.name === 'nearby')) push({ name: 'nearby', tripId: route.tripId, day: route.day });
  };

  return (
    <ScreenShell
      frame="Mobile 14 AI Suggestions"
      tone="brand"
      title="여백에 맞는 장소"
      onBack={canGoBack ? back : () => reset({ name: 'schedules' })}
      trailing={<BellButton />}
      contentClassName="nearby-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <section className="gap-tile" aria-label="남은 여백">
        <img src={sparkles} alt="" width={22} height={22} />
        <div>
          <strong>남은 여백 {formatDuration(n.gap.minutes)}</strong>
          <span>{n.gap.after ? `${n.gap.after.time} ${n.gap.after.place} 일정은 유지해요` : `${n.gap.end}까지 비어 있어요`}</span>
        </div>
      </section>

      <section className="rec-summary">
        <div className="section-row">
          <div>
            <h2>
              추천 {n.visible.length}개 / 최대 {MAX_COUNT}개
            </h2>
            <p>취향에 맞춰 3개 추천 · 원할 때 2개 더 보기</p>
          </div>
          <span className="chip chip-soft">AI 추천</span>
        </div>
        <ul className="tag-row" aria-label="선택한 취향">
          {[...n.prefs.categories, n.prefs.mood].map((t) => (
            <li key={t} className="chip chip-soft">
              {t}
            </li>
          ))}
        </ul>
        <button type="button" className="link-button link-icon" onClick={changePrefs}>
          <img src={sparkles} alt="" width={16} height={16} />
          취향 변경
        </button>
      </section>

      {n.visible.length === 0 && (
        <div className="empty-day">
          추천할 장소를 모두 확인했어요.
          <br />
          <button type="button" className="link-button" onClick={n.restore}>
            숨긴 추천 다시 보기
          </button>
        </div>
      )}

      {n.visible.map((p) => (
        <div key={p.id} className="sugg-group">
          <SuggestionCard
            place={p}
            onLike={() => n.like(p)}
            onDislike={() => setAsking(p.id)}
            asking={asking === p.id}
          />
          {asking === p.id && (
            <section className="ask-card" role="dialog" aria-labelledby={`ask-${p.id}`}>
              <h3 id={`ask-${p.id}`}>다른 장소로 추천할까요?</h3>
              <p>
                예: 이 카드만 다른 장소로 바꿔요.
                <br />
                아니오: 현재 추천을 유지해요.
                <br />
                일정에는 추가하지 않아요.
              </p>
              <div className="vote-row">
                <button
                  type="button"
                  className="btn-vote is-like"
                  onClick={() => {
                    setAsking(null);
                    n.dislike(p);
                  }}
                >
                  예
                </button>
                <button
                  type="button"
                  className="btn-vote"
                  onClick={() => {
                    setAsking(null);
                    showToast('현재 추천을 그대로 둘게요.');
                  }}
                >
                  아니오
                </button>
              </div>
            </section>
          )}
        </div>
      ))}

      {n.canExpand && (
        <button type="button" className="btn-outline" onClick={n.expand}>
          2개 더 보기
        </button>
      )}

      <p className="footnote">
        이동시간은 예상이며 대중교통은 정류장 접근을 포함해요. 좋아요는 일정에 추가하고 싫어요는 추가하지 않아요. 방문 전
        운영시간과 예약 조건을 확인해 주세요. (데모 데이터)
      </p>
    </ScreenShell>
  );
}

function SuggestionCard({
  place,
  onLike,
  onDislike,
  asking,
}: {
  place: NearbyPlace;
  onLike: () => void;
  onDislike: () => void;
  asking: boolean;
}) {
  return (
    <article className={`sugg-card ${asking ? 'is-asking' : ''}`} aria-labelledby={`sugg-${place.id}`}>
      <div className="sugg-main">
        {place.photo ? (
          <img src={place.photo} alt="" width={94} height={100} />
        ) : (
          <span className="sugg-photo-empty" aria-hidden="true">
            {place.category}
          </span>
        )}
        <div>
          <h3 id={`sugg-${place.id}`}>{place.shortName}</h3>
          <strong>
            도보 예상 {place.walk}분 · 대중교통 예상 {place.transit}분 · 체류{place.stay}분
          </strong>
          <span>{place.tag}</span>
        </div>
      </div>
      <p>{place.reason}</p>
      <div className="vote-row">
        <button type="button" className="btn-vote is-like" onClick={onLike} aria-label={`${place.shortName} 좋아요 — 일정에 추가`}>
          <img src={thumbsUpWhite} alt="" width={16} height={16} />
          좋아요
        </button>
        <button
          type="button"
          className="btn-vote"
          onClick={onDislike}
          aria-expanded={asking}
          aria-label={`${place.shortName} 싫어요`}
        >
          <img src={thumbsDown} alt="" width={16} height={16} />
          싫어요
        </button>
      </div>
    </article>
  );
}
