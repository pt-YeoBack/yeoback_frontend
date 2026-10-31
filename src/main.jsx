// 공유 링크에 #start가 있으면 저장된 데모 데이터를 지우고 처음부터 (다른 모듈보다 먼저)
import './lib/startFresh';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './css/tokens.css';
import './css/app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
