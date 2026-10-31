import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, ConfirmDialog } from '../components/TripParts';
import { bookOpen, lock } from '../components/icons';
import { useAppState } from '../lib/appState';
import { todayISO } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { useWorld } from '../lib/worldStore';
import { Bubble, longDate, memberLine } from './ChatScreen';

/** Mobile 22 Archived Conversation · 다시 읽는 인연 (읽기 전용) */
export function ArchiveScreen({ route }: { route: Extract<Route, { name: 'archive' }> }) {
  const { back, canGoBack, reset, push } = useNav();
  const { showToast } = useAppState();
  const world = useWorld();
  const g = world.getGathering(route.gatheringId);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!g) reset({ name: 'profile' });
  }, [g, reset]);

  if (!g) return null;
  const deleted = world.archiveDeleted.includes(g.id);
  const visible = world.profile.privacy.autosave && !deleted;
  const messages = visible ? world.messagesOf(g.id) : [];
  const goBack = () => (canGoBack ? back() : reset({ name: 'profile' }));

  return (
    <ScreenShell
      frame="Mobile 22 Archived Conversation"
      tone="brand"
      title="저장된 대화"
      subtitle={`수첩 · ${todayISO().replace(/-/g, '.')} 열람`}
      onBack={goBack}
      trailing={<BellButton />}
      contentClassName="chat-content"
      bottomNav={<BottomNav active="profile" />}
    >
      <p className="guidance-title archive-chip">
        <img src={bookOpen} alt="" width={22} height={22} />
        <span className="chip chip-solid">저장된 대화 · 읽기 전용</span>
      </p>

      <section className="archive-card">
        <h2>{g.title}</h2>
        <p>
          {g.date.replace(/-/g, '.')} · {g.start}–{g.end}
          <br />
          {g.place}
        </p>
        <small>{memberLine(g, world.profile.privacy.nickname ? world.profile.nickname : '여행자', true)}</small>
      </section>

      {visible ? (
        <>
          <p className="chat-date">{longDate(g.date)} · 현지 시간</p>
          <ol className="chat-list" aria-label="저장된 대화 내용">
            {messages.map((m) => (
              <Bubble
                key={m.id}
                m={m}
                me={world.profile.privacy.nickname ? world.profile.nickname : '여행자'}
                onAuthor={(nickname) => push({ name: 'member', nickname })}
              />
            ))}
          </ol>
          <section className="lock-card">
            <img src={lock} alt="" width={20} height={20} />
            <p>
              함께 나눈 대화와 원래 시간을 보관했어요.
              <br />
              여행이 끝난 뒤에도 다시 읽을 수 있어요.
            </p>
          </section>
        </>
      ) : (
        <p className="empty-day">
          {deleted ? '이 대화 기록은 직접 삭제했어요.' : '수첩 대화 자동 저장이 꺼져 있어 보관한 대화가 없어요. 세부 설정에서 다시 켤 수 있어요.'}
        </p>
      )}

      <button type="button" className="btn-outline btn-outline-strong" onClick={goBack}>
        수첩의 하루 기록으로 돌아가기
      </button>
      {visible && (
        <button type="button" className="link-button link-center-brand" onClick={() => setDeleting(true)}>
          이 대화 기록 삭제
        </button>
      )}
      <p className="footnote center">저장된 대화는 나만 볼 수 있어요. 삭제는 직접 선택할 때만 이루어져요.</p>

      {deleting && (
        <ConfirmDialog
          title="대화 기록을 삭제할까요?"
          message="수첩에서 이 모임의 대화를 더 이상 보여 주지 않아요. (데모에서는 대화방에 새 메시지를 보내면 다시 보관돼요)"
          confirmLabel="삭제"
          danger
          onCancel={() => setDeleting(false)}
          onConfirm={() => {
            world.deleteArchive(g.id);
            setDeleting(false);
            showToast('대화 기록을 수첩에서 삭제했어요.');
          }}
        />
      )}
    </ScreenShell>
  );
}
