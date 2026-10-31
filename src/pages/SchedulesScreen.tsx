import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { aiIcon, plusBrand, plusCircle28 } from '../components/icons';
import jejuPhoto from '../assets/destination-jeju.jpg';
import { useAppState } from '../lib/appState';
import { useNav } from '../lib/navigation';
import { Trip, tripTitle, useTrips } from '../lib/tripStore';
import { DestinationThumb, tripDateRange, tripPeopleLine } from './tripFormat';

/** Mobile 11 My Schedules · 나의 여행 */
export function SchedulesScreen() {
  const { push } = useNav();
  const { showToast } = useAppState();
  const { trips, draft, startNewTrip } = useTrips();
  const unsaved = draft && !trips.some((t) => t.id === draft.id) ? draft : null;

  const newTrip = () => {
    startNewTrip({ fresh: !unsaved });
    push({ name: 'newTrip' });
  };

  return (
    <ScreenShell
      frame="Mobile 11 My Schedules"
      tone="brand"
      title="나의 일정"
      noBackSlot
      trailing={<BellButton />}
      surface="mist"
      contentClassName="schedules-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <div className="section-row">
        <h2 className="page-heading">떠날 날을 기다리며</h2>
        <button type="button" className="icon-button icon-28" onClick={newTrip} aria-label="새 여행 일정 만들기">
          <img src={plusCircle28} alt="" width={28} height={28} />
        </button>
      </div>

      {unsaved && (
        <button type="button" className="draft-banner" onClick={() => push({ name: unsaved.startDate ? 'itinerary' : 'newTrip' })}>
          작성 중인 여행이 있어요 · 이어서 작성하기
        </button>
      )}

      {trips.length === 0 && !unsaved && (
        <p className="empty-day">아직 저장한 여행이 없어요. 아래 버튼으로 첫 여행을 만들어 보세요.</p>
      )}

      <ul className="schedule-list">
        {trips.map((trip) => (
          <li key={trip.id}>
            <ScheduleCard trip={trip} onOpen={() => push({ name: 'dayPlan', tripId: trip.id })} />
          </li>
        ))}
        <li>
          {/* Figma에 그려진 예시 일정 — 실제 데이터가 아님을 표시하고, 누르면 안내만 보여 준다 */}
          <button
            type="button"
            className="schedule-card is-sample"
            onClick={() => showToast('제주 일정은 Figma에 그려진 예시예요. + 버튼으로 내 여행을 만들어 보세요.')}
          >
            <img className="schedule-photo" src={jejuPhoto} alt="" />
            <span className="schedule-chips">
              <span className="chip">국내 · 예시 일정</span>
              <span className="schedule-place">대한민국 · 제주</span>
            </span>
            <strong className="schedule-title">제주, 바다를 따라</strong>
            <span className="schedule-meta">2026.12.05 – 12.07 · 2명</span>
            <span className="schedule-sub">성산일출봉 · 다음 여행을 위한 샘플</span>
          </button>
        </li>
      </ul>

      <section className="ai-tile" aria-labelledby="ai-tile-title">
        <img src={aiIcon} alt="" width={36} height={36} />
        <h2 id="ai-tile-title">여행의 여백을 AI가 채워줘요</h2>
        <p>일정, 장소, 인원을 입력하면 AI가 추천 루트를 만들어드려요.</p>
      </section>

      <button type="button" className="btn-outline btn-icon" onClick={newTrip}>
        <img src={plusBrand} alt="" width={22} height={22} />새 여행 일정 만들기
      </button>
    </ScreenShell>
  );
}

function ScheduleCard({ trip, onOpen }: { trip: Trip; onOpen: () => void }) {
  const dest = trip.destination;
  const count = Object.values(trip.days).reduce((n, d) => n + d.activities.length, 0);
  return (
    <button type="button" className="schedule-card" onClick={onOpen} aria-label={`${tripTitle(trip)} 일정 보기`}>
      <DestinationThumb destination={dest} className="schedule-photo" />
      <span className="schedule-chips">
        <span className="chip chip-solid">{trip.region === 'domestic' ? '국내' : '해외'} · 저장 완료</span>
        <span className="schedule-place">{dest ? `${dest.country} · ${dest.city}` : '여행지 미정'}</span>
      </span>
      <strong className="schedule-title">{tripTitle(trip)}</strong>
      <span className="schedule-meta">{tripDateRange(trip)}</span>
      <span className="schedule-sub">
        {tripPeopleLine(trip)} · 일정 {count}개
      </span>
    </button>
  );
}
