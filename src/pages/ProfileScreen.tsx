import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav } from '../components/TripParts';
import { Avatar } from '../components/WorldParts';
import { bookOpen, chevronRight20, palette, pencil, settingsGear, shieldCheck, sliders } from '../components/icons';
import { todayISO } from '../lib/dates';
import { useNav } from '../lib/navigation';
import { Trip, tripDates, tripTitle, useTrips } from '../lib/tripStore';
import { useWorld } from '../lib/worldStore';
import { DestinationThumb, tripDateRange } from './tripFormat';

/** 여행 상태 — 끝난 날짜 기준 */
export function tripStatus(trip: Trip): string {
  const today = todayISO();
  if (!trip.startDate || !trip.endDate) return '날짜 미정';
  if (trip.endDate < today) return '여행 완료';
  if (trip.startDate <= today) return '여행 중';
  return '여행 예정';
}

/** 수첩 통계: 날짜별 기록 · 만난 인연 · 저장된 대화 */
export function useNotebookStats() {
  const world = useWorld();
  return (trip: Trip) => {
    const dates = tripDates(trip);
    const inTrip = world.gatherings.filter((g) => (world.isJoined(g.id) || g.mine) && dates.includes(g.date));
    const people = new Set(inTrip.flatMap((g) => g.members.map((m) => m.nickname)));
    const chats = world.profile.privacy.autosave
      ? inTrip.filter((g) => !world.archiveDeleted.includes(g.id) && world.messagesOf(g.id).length > 0)
      : [];
    return { days: dates.length, people: people.size, chats: chats.length, gatherings: inTrip, chatGatherings: chats };
  };
}

/** Mobile 20 Profile · 나의 수첩 */
export function ProfileScreen() {
  const { push } = useNav();
  const { trips } = useTrips();
  const { profile } = useWorld();
  const stats = useNotebookStats();
  const today = todayISO().replace(/-/g, '.');

  return (
    <ScreenShell
      frame="Mobile 20 Profile"
      tone="brand"
      title="프로필"
      noBackSlot
      trailing={<BellButton />}
      contentClassName="profile-content"
      bottomNav={<BottomNav active="profile" />}
    >
      <section className="profile-head">
        <Avatar nickname={profile.nickname} avatar={profile.avatar} size={70} />
        <div>
          <h2>{profile.nickname}</h2>
          <p>
            인연 닉네임 · {profile.privacy.nickname ? profile.nickname : '비공개'}
            <br />
            실명·연락처 공유 {profile.privacy.contact ? '켜짐' : '꺼짐'}
            <br />
            {profile.intro || '소개를 적어 보세요'}
          </p>
        </div>
        <button type="button" className="icon-button" onClick={() => push({ name: 'profileEdit' })} aria-label="프로필 수정">
          <img src={pencil} alt="" width={19} height={19} />
        </button>
      </section>

      <button type="button" className="taste-card" onClick={() => push({ name: 'settings' })} aria-label="나의 여행 취향 — 설정으로 이동">
        <strong>나의 여행 취향</strong>
        <span className="tag-row">
          {profile.tastes.slice(0, 4).map((t) => (
            <span key={t} className="chip chip-soft">
              {t}
            </span>
          ))}
          {profile.tastes.length === 0 && <span className="taste-empty">취향을 골라 보세요</span>}
        </span>
        <span className="taste-keywords">{profile.keywords.join(' / ') || '키워드 없음'}</span>
      </button>

      <div className="section-row notebook-head">
        <h2 className="guidance-title">
          <img src={bookOpen} alt="" width={24} height={24} />
          수첩
        </h2>
        <span>{today} 기준</span>
      </div>
      <p className="notebook-lead">
        날짜별 일정, 잠깐 만난 사람,
        <br />
        함께 나눈 대화를 그대로 간직해요.
      </p>

      {trips.length === 0 && <p className="empty-day">저장한 여행이 생기면 여기에 수첩이 만들어져요.</p>}

      {trips.map((trip) => {
        const s = stats(trip);
        return (
          <article key={trip.id} className="notebook-card">
            <DestinationThumb destination={trip.destination} className="notebook-photo" />
            <span className="chip chip-soft">
              {trip.destination ? `${trip.destination.country} · ${trip.destination.city}` : '여행지 미정'} / {tripStatus(trip)}
            </span>
            <h3>{tripTitle(trip)}</h3>
            <p className="notebook-meta">
              {tripDateRange(trip, '–')} · {s.days ? `${s.days - 1}박 ${s.days}일` : ''} · {1 + trip.companions.length}명
            </p>
            <dl className="notebook-stats">
              <div>
                <dt>날짜별 기록</dt>
                <dd>{s.days}일</dd>
              </div>
              <div>
                <dt>만난 인연</dt>
                <dd>{s.people}명</dd>
              </div>
              <div>
                <dt>저장된 대화</dt>
                <dd>{s.chats}개</dd>
              </div>
            </dl>
            <button type="button" className="row-link" onClick={() => push({ name: 'notebook', tripId: trip.id })}>
              수첩 펼치기 · 저장된 대화 보기
              <img src={chevronRight20} alt="" width={20} height={20} />
            </button>
          </article>
        );
      })}

      <section className="settings-group" aria-labelledby="settings-group-title">
        <h2 id="settings-group-title" className="guidance-title settings-group-title">
          <img src={settingsGear} alt="" width={22} height={22} />
          세부 설정
        </h2>
        <nav className="settings-links" aria-label="세부 설정">
          <button type="button" className="row-link" onClick={() => push({ name: 'settings' })}>
            <img src={sliders} alt="" width={22} height={22} />
            여행 취향 설정
            <img src={chevronRight20} alt="" width={20} height={20} />
          </button>
          <button type="button" className="row-link" onClick={() => push({ name: 'settings', section: 'privacy' })}>
            <img src={shieldCheck} alt="" width={22} height={22} />
            닉네임·공개 범위·대화 보관 설정
            <img src={chevronRight20} alt="" width={20} height={20} />
          </button>
          <button type="button" className="row-link" onClick={() => push({ name: 'settings', section: 'color' })}>
            <img src={palette} alt="" width={22} height={22} />
            컬러 조합 선택
            <img src={chevronRight20} alt="" width={20} height={20} />
          </button>
        </nav>
      </section>
    </ScreenShell>
  );
}
