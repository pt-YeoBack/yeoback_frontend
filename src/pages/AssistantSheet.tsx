import { SafeForm } from '../components/SafeForm';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { BottomSheet, ConfirmDialog } from '../components/TripParts';
import { send, sparkles } from '../components/icons';
import { answer, QUICK_QUESTIONS } from '../lib/assistant';
import { Route, useNav } from '../lib/navigation';
import { newId, useTrips } from '../lib/tripStore';
import { AssistantMessage, useWorld } from '../lib/worldStore';

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Mobile 16 지도 왼쪽 아래 ✦ 버튼 → "여백 도우미" 대화창
 * Figma에는 버튼만 있고 대화창 디자인이 없어, 기존 바텀 시트·말풍선 스타일로 만들었습니다.
 * 실제 AI가 아닌 규칙 기반 데모 응답기(lib/assistant.ts)를 씁니다.
 */
export function AssistantSheet({ onClose }: { onClose: () => void }) {
  const { push } = useNav();
  const world = useWorld();
  const { trips } = useTrips();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const log = world.assistantLog;
  const nickname = world.profile.privacy.nickname ? world.profile.nickname : '여행자';

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [log.length, typing]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    const mine: AssistantMessage = { id: newId('ai'), from: 'me', text: q, time: nowTime() };
    world.addAssistant([mine]);
    setText('');
    setTyping(true);
    const trip = [...trips].sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''))[0];
    const reply = answer(q, {
      gatherings: world.gatherings,
      isJoined: world.isJoined,
      memberCount: world.memberCount,
      trip,
      nickname,
    });
    // 바로 답하면 어색해서 잠깐 "입력 중" 표시 후 보여 준다 (실제 서버 응답 대기 아님)
    timer.current = window.setTimeout(() => {
      world.addAssistant([{ id: newId('ai'), from: 'bot', text: reply.text, time: nowTime(), actions: reply.actions }]);
      setTyping(false);
    }, 450);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(text);
  };

  const go = (route: Route) => {
    onClose();
    push(route);
  };

  return (
    <BottomSheet
      title="여백 도우미"
      onClose={onClose}
      footer={
        <SafeForm className="chat-input assistant-input" onSubmit={submit}>
          <label className="sr-only" htmlFor="assistant-text">
            도우미에게 질문
          </label>
          <input
            id="assistant-text"
            value={text}
            maxLength={200}
            placeholder="예) 오늘 저녁 같이 먹을 모임 있어?"
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="chat-send" aria-label="질문 보내기" disabled={!text.trim() || typing}>
            <img src={send} alt="" width={36} height={36} />
          </button>
        </SafeForm>
      }
    >
      <p className="assistant-notice">
        <img src={sparkles} alt="" width={16} height={16} />
        <span>
          <strong>데모 도우미 · 실제 AI 연결 전</strong>
          이 기기에 있는 모임·여행 정보로 정해진 답을 보여 줘요. 답이 틀릴 수 있어요.
        </span>
      </p>

      <ol className="chat-list assistant-list" aria-label="도우미 대화" aria-live="polite">
        {log.length === 0 && (
          <li className="bubble-row">
            <span className="bubble-author">여백 도우미</span>
            <p className="bubble">
              {`안녕하세요, ${nickname}님! 지금 시간이 맞는 모임을 찾거나, 참여·만들기 방법과 안전 수칙을 알려 드릴게요.`}
            </p>
          </li>
        )}
        {log.map((m) => (
          <li key={m.id} className={`bubble-row ${m.from === 'me' ? 'is-mine' : ''}`}>
            <span className="bubble-author">{m.from === 'me' ? nickname : '여백 도우미'}</span>
            <p className="bubble">{m.text}</p>
            {m.actions && m.actions.length > 0 && (
              <div className="assistant-actions">
                {m.actions.map((a) => (
                  <button key={a.label} type="button" className="chip chip-solid" onClick={() => go(a.route as Route)}>
                    {a.label} ›
                  </button>
                ))}
              </div>
            )}
            <span className="bubble-time">{m.time}</span>
          </li>
        ))}
        {typing && (
          <li className="bubble-row">
            <span className="bubble-author">여백 도우미</span>
            <p className="bubble assistant-typing" aria-label="답변을 만드는 중">
              <span />
              <span />
              <span />
            </p>
          </li>
        )}
      </ol>
      <div ref={endRef} />

      <div className="assistant-quick" role="group" aria-label="추천 질문">
        {QUICK_QUESTIONS.map((qq) => (
          <button key={qq} type="button" className="choice-chip" onClick={() => ask(qq)} disabled={typing}>
            {qq}
          </button>
        ))}
      </div>

      {log.length > 0 && (
        <button type="button" className="link-button link-center-brand" onClick={() => setConfirmClear(true)}>
          대화 지우기
        </button>
      )}

      {confirmClear && (
        <ConfirmDialog
          title="도우미 대화를 지울까요?"
          message="이 기기에 저장된 도우미 대화가 모두 지워져요."
          confirmLabel="지우기"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            world.clearAssistant();
            setConfirmClear(false);
          }}
        />
      )}
    </BottomSheet>
  );
}
