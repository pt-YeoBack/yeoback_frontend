import { SafeForm } from '../components/SafeForm';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, BottomSheet, ConfirmDialog } from '../components/TripParts';
import { bookOpen, check, plusBrand, send } from '../components/icons';
import { useAppState } from '../lib/appState';
import { fromISO, weekday } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { ChatMessage, Gathering, useWorld } from '../lib/worldStore';

export function longDate(iso: string): string {
  const d = fromISO(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday(iso)}요일`;
}

export function memberLine(g: Gathering, me: string, includeMe: boolean): string {
  const names = [...g.members.map((m) => m.nickname)];
  if (includeMe) names.splice(g.mine ? 0 : Math.min(2, names.length), 0, me);
  return `${names.join(' · ')} / ${names.length}명`;
}

/** Mobile 19 Group Chat · 수첩에 저장되는 대화 */
export function ChatScreen({ route }: { route: Extract<Route, { name: 'chat' }> }) {
  const { back, canGoBack, reset, replace, push } = useNav();
  const { showToast } = useAppState();
  const world = useWorld();
  const g = world.getGathering(route.id);
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const joined = g ? world.isJoined(g.id) || g.mine : false;
  const messages = g ? world.messagesOf(g.id) : [];

  useEffect(() => {
    if (!g) reset({ name: 'connections' });
    else if (!joined) replace({ name: 'gathering', id: g.id });
  }, [g, joined, reset, replace]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  if (!g || !joined) return null;
  const me = world.profile.privacy.nickname ? world.profile.nickname : '여행자';
  const autosave = world.profile.privacy.autosave;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    world.sendMessage(g.id, v);
    setText('');
  };

  return (
    <ScreenShell
      frame="Mobile 19 Group Chat"
      tone="brand"
      title={g.title}
      subtitle={memberLine(g, me, true)}
      onBack={canGoBack ? back : () => replace({ name: 'gathering', id: g.id })}
      trailing={<BellButton />}
      contentClassName="chat-content"
      bottomNav={<BottomNav active="connections" />}
    >
      <section className="chat-info">
        <strong>
          {g.date.slice(5).replace('-', '.')} {g.start}–{g.end} · {g.place}
        </strong>
        <span>
          {g.meetNote} · {world.memberCount(g)} / {g.maxPeople}명 참여
        </span>
      </section>

      <button
        type="button"
        role="switch"
        aria-checked={autosave}
        className="save-toggle"
        onClick={() => {
          world.updateProfile({ privacy: { ...world.profile.privacy, autosave: !autosave } });
          showToast(autosave ? '수첩 자동 저장을 껐어요. 수첩에서 이 대화가 보이지 않아요.' : '대화를 수첩에 저장해요.');
        }}
      >
        <img src={bookOpen} alt="" width={20} height={20} />
        <span>{autosave ? '대화는 수첩에 저장돼요' : '수첩 저장이 꺼져 있어요'}</span>
        {autosave && <img src={check} alt="" width={17} height={17} />}
      </button>

      <p className="chat-date">{longDate(g.date)} · 현지 시간</p>

      <ol className="chat-list" aria-label="대화 내용" aria-live="polite">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} me={me} onAuthor={(nickname) => push({ name: 'member', nickname, gatheringId: g.id })} />
        ))}
      </ol>
      <div ref={endRef} />

      <SafeForm className="chat-input" onSubmit={submit}>
        <button type="button" className="icon-button" aria-label="사진·파일 첨부" onClick={() => showToast('첨부 기능은 서버 연결 후 제공돼요.')}>
          <img src={plusBrand} alt="" width={20} height={20} />
        </button>
        <label className="sr-only" htmlFor="chat-text">
          메시지
        </label>
        <input id="chat-text" value={text} maxLength={300} placeholder="메시지를 입력해 주세요" onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="chat-send" aria-label="보내기" disabled={!text.trim()}>
          <img src={send} alt="" width={36} height={36} />
        </button>
      </SafeForm>

      <div className="chat-foot">
        <span>{autosave ? '수첩 저장 중 · 여행 후에도 다시 읽어요' : '수첩에 저장하지 않는 중'}</span>
        <button type="button" className="link-button" onClick={() => setMenu(true)}>
          신고 / 나가기
        </button>
      </div>
      <p className="footnote">데모: 서버가 없어서 내가 보낸 메시지는 이 브라우저에만 저장되고 다른 참여자에게 전달되지 않아요.</p>

      {menu && (
        <BottomSheet title="대화방 메뉴" onClose={() => setMenu(false)}>
          <div className="sheet-actions sheet-actions-stack">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setMenu(false);
                showToast('신고 기능은 서버 연결 후 제공돼요. 지금은 접수되지 않아요.');
              }}
            >
              신고하기 (연결 필요)
            </button>
            {!g.mine && (
              <button
                type="button"
                className="btn-text btn-text-danger"
                onClick={() => {
                  setMenu(false);
                  setLeaving(true);
                }}
              >
                모임 나가기
              </button>
            )}
          </div>
        </BottomSheet>
      )}

      {leaving && (
        <ConfirmDialog
          title="모임에서 나갈까요?"
          message="대화방에서 나가요. 나중에 다시 참여할 수 있어요."
          confirmLabel="나가기"
          danger
          onCancel={() => setLeaving(false)}
          onConfirm={() => {
            world.leave(g.id);
            setLeaving(false);
            showToast('모임에서 나왔어요.');
            reset({ name: 'connections' });
          }}
        />
      )}
    </ScreenShell>
  );
}

export function Bubble({ m, me, onAuthor }: { m: ChatMessage; me: string; onAuthor?: (nickname: string) => void }) {
  const mine = m.author === '__me';
  return (
    <li className={`bubble-row ${mine ? 'is-mine' : ''}`}>
      {!mine && onAuthor ? (
        <button type="button" className="bubble-author bubble-author-link" onClick={() => onAuthor(m.author)} aria-label={`${m.author} 프로필 보기`}>
          {m.author}
          {m.role ? ` · ${m.role}` : ''}
        </button>
      ) : (
        <span className="bubble-author">
          {mine ? me : m.author}
          {m.role ? ` · ${m.role}` : ''}
        </span>
      )}
      <p className="bubble">{m.text}</p>
      <span className="bubble-time">{m.time}</span>
    </li>
  );
}
