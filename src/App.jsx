// src/App.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  LogOut,
  RefreshCw,
  Sparkles,
  UploadCloud,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { db } from './firebaseConfig';
import LoginModal from './components/LoginModal';
import LoadingTransition from './components/LoadingTransition';
import RequestBoard from './components/RequestBoard';
import { COMPANY_INFO, DEMO_USERS, ROLES } from './constants';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  // Firestore 실시간 신청 목록 상태
  const [requests, setRequests] = useState([]);

  // 향후 AI 봇이 신청 모달을 자동으로 띄울 때 사용할 상태
  const [externalFormModal, setExternalFormModal] = useState({
    isOpen: false,
    prefill: null,
  });

  // 저장된 로그인 세션 복원
  useEffect(() => {
    const saved = localStorage.getItem('ramos_hr_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('ramos_hr_user');
      }
    }
  }, []);

  // Firestore 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, 'hr_requests'),
      orderBy('createdAtClient', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setRequests(list);
      },
      (err) => {
        console.error('Firestore 실시간 구독 오류:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser, remember) => {
    setUser(loggedInUser);
    setIsLoadingBoard(true);
    if (remember) {
      localStorage.setItem('ramos_hr_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('ramos_hr_user');
    }
  };

  const handleQuickSwitch = (targetUser) => {
    setUser(targetUser);
    localStorage.setItem('ramos_hr_user', JSON.stringify(targetUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoadingBoard(false);
    localStorage.removeItem('ramos_hr_user');
  };

  if (!user) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  if (isLoadingBoard) {
    return (
      <LoadingTransition
        user={user}
        onComplete={() => setIsLoadingBoard(false)}
      />
    );
  }

  const isMaster = user.role === ROLES.MASTER;

  // 권한에 맞는 실시간 통계 계산
  const scopedRequests = isMaster
    ? requests
    : requests.filter((r) => r.branch === user.branch);
  const pendingCount = scopedRequests.filter((r) => r.status === 'PENDING').length;
  const completedCount = scopedRequests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col">
      {/* 상단 네이비 글로벌 헤더 */}
      <header className="bg-[#0B1E3B] text-white shadow-md sticky top-0 z-30 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-base shadow-inner">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base">
                  {COMPANY_INFO.appName}
                </span>
                <span className="text-[11px] text-blue-200/80 font-medium hidden sm:inline">
                  | {COMPANY_INFO.koName}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide ${
                    isMaster
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/15 text-blue-200 border border-blue-400/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/70">
                {user.branch} · {user.name} ({user.empNo})
              </p>
            </div>
          </div>

          {/* 우측 시연용 MASTER / MEMBER 즉시 전환기 & 로그아웃 */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center bg-[#071429] p-1 rounded-xl border border-blue-800/60">
              <span className="text-[11px] text-blue-300/70 px-2.5 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> 권한 전환
              </span>
              {DEMO_USERS.slice(0, 2).map((u) => (
                <button
                  key={u.uid}
                  onClick={() => handleQuickSwitch(u)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    user.uid === u.uid
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-200/70 hover:text-white'
                  }`}
                >
                  {u.role === ROLES.MASTER
                    ? 'MASTER (본사)'
                    : 'MEMBER (부산지사)'}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-rose-500/20 hover:text-rose-200 text-blue-100 border border-white/10 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 그리드 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-5">
          {/* 실시간 요약 카드 3종 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isMaster ? '전 지사 승인 대기' : '내 지사 대기중'}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B1E3B] mt-2">
                {pendingCount}건
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  {isMaster ? '발급 완료 (파일 등록됨)' : '발급 완료 (다운로드)'}
                </span>
                {isMaster ? (
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-2xl font-extrabold text-blue-600 mt-2">
                {completedCount}건
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>총 누적 요청 건수</span>
                <CheckCircle className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">
                {scopedRequests.length}건
              </p>
            </div>
          </div>

          {/* 실제 Firestore 연동 문서 신청/등록 보드 */}
          <RequestBoard
            user={user}
            requests={requests}
            externalFormModal={externalFormModal}
            setExternalFormModal={setExternalFormModal}
          />
        </section>

        {/* 우측 라모스 네이비 AI 에이전트 패널 (다음 단계에서 실제 봇 컴포넌트 탑재) */}
        <aside className="lg:col-span-4">
          <div className="bg-[#0B1E3B] text-white rounded-2xl p-5 shadow-lg border border-blue-900/50 flex flex-col h-[530px] sticky top-24">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Ramos AI 업무 비서</h3>
                <p className="text-[11px] text-blue-200/70">
                  {isMaster
                    ? '대기 건 브리핑 · 빠른 검색 지원'
                    : '자연어 한 줄로 문서 신청 자동 실행'}
                </p>
              </div>
            </div>

            <div className="flex-1 py-4 text-xs text-blue-100/80 flex flex-col justify-center items-center text-center px-3">
              <p className="bg-white/10 border border-white/10 rounded-xl p-3.5 leading-relaxed">
                💬 다음 단계에서 연결될 명령어:
                <br />
                <span className="text-white font-semibold">
                  "김민정님의 은행 제출용 재직증명서를 요청해줘"
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <input
                type="text"
                disabled
                placeholder="Firebase 연동 확인 후 AI 봇을 활성화합니다..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-blue-200/40"
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
