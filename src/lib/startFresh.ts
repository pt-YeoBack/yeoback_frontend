/**
 * 공유 링크용 "처음 상태로 시작"
 *
 * 링크 끝에 #start(또는 #reset)를 붙여 열면, 앱이 그리기 전에 이 브라우저에 저장된
 * 여백 데모 데이터(로그인 세션·가입 계정·여행·모임·대화·화면 기록)를 모두 지우고
 * 첫 화면(Mobile 01)부터 시작합니다. Figma 등에 붙이는 공유 링크는 이 주소를 쓰세요.
 * 링크에 #start가 없으면 지금처럼 이어서 보던 상태가 유지됩니다.
 *
 * main.tsx에서 가장 먼저 import해야 다른 모듈이 저장소를 읽기 전에 실행됩니다.
 */
const FRESH_TOKENS = ['#start', '#reset'];

export const STARTED_FRESH = (() => {
  let hash = '';
  try {
    hash = window.location.hash.toLowerCase();
  } catch {
    return false;
  }
  if (!FRESH_TOKENS.includes(hash)) return false;
  for (const store of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const s = store();
      Object.keys(s)
        .filter((k) => k.startsWith('yeobaek.'))
        .forEach((k) => s.removeItem(k));
    } catch {
      /* 저장소를 쓸 수 없는 환경: 원래 저장된 게 없으므로 그대로 처음 상태 */
    }
  }
  // 새로고침할 때마다 다시 지워지지 않도록 주소에서 #start를 뗀다
  try {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  } catch {
    /* 주소를 바꿀 수 없는 환경이면 그대로 둔다 */
  }
  return true;
})();
