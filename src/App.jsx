// src/App.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Sparkles, UploadCloud, FilePlus2, CheckCircle, Clock } from 'lucide-react';
import LoginModal from './components/LoginModal';
import LoadingTransition from './components/LoadingTransition';
import { COMPANY_INFO, DEMO_USERS, ROLES } from './constants';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  // 저장된 세션 복원
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

  const handleLoginSuccess = (loggedInUser, remember) => {
    setUser(loggedInUser);
    setIsLoadingBoard(true); // 3초 시네마틱 로딩 시작
    if (remember) {
      localStorage.setItem('ramos_hr_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('ramos_hr_user');
    }
  };

  // 발표 중 상단에서 즉시 권한 전환 (로딩 생략하고 즉시 전환)
  const handleQuickSwitch = (targetUser) => {
    setUser(targetUser);
    localStorage.setItem('ramos_hr_user', JSON.stringify(targetUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoadingBoard(false);
    localStorage.removeItem('ramos_hr_user');
  };

  // 1) 미로그인 상태 -> 로그인 모달
  if (!user) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  // 2) 로그인 직후 -> 시네마틱 로딩 트랜지션
  if (isLoadingBoard) {
    return <LoadingTransition user={user} onComplete={() => setIsLoadingBoard(false)} />;
  }

  const isMaster = user.role === ROLES.MASTER;

  // 3) 메인 워크스페이스 (남색 헤더 + 화이트 보드 + 블루 포인트)
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col">
      {/* 라모스 테크놀러지 시그니처 딥 네이비 GNB */}
      <header className="bg-[#0B1E3B] text-white shadow-md sticky top-0 z-30 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* 좌측 회사명 & 앱 타이틀 */}
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

          {/* 우측 시연용 MASTER/MEMBER 스위처 & 로그아웃 */}
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
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-200/70 hover:text-white'
                  }`}
                >
                  {u.role === ROLES.MASTER ? 'MASTER (본사)' : 'MEMBER (부산지사)'}
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

      {/* 메인 컨텐츠 그리드 (좌측 8: 문서 신청/발급 보드, 우측 4: AI 액션 봇) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측 메인 업무 영역 */}
        <section className="lg:col-span-8 space-y-5">
          {/* 상태 요약 바 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isMaster ? '전 지사 승인 대기' : '내 신청 대기중'}</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#0B1E3B] mt-2">2건</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isMaster ? '문서 파일 등록 필요' : '발급 완료 (다운로드 가능)'}</span>
                {isMaster ? (
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-2xl font-extrabold text-blue-600 mt-2">1건</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>이번 달 누적 처리</span>
                <CheckCircle className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">28건</p>
            </div>
          </div>

          {/* 역할별 메인 보드 틀 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 min-h-[430px] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              {isMaster ? <UploadCloud className="w-6 h-6" /> : <FilePlus2 className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-extrabold text-[#0B1E3B]">
              {isMaster
                ? '본사 MASTER 통합 신청 확인 & 문서 등록 보드'
                : `${user.branch} (MEMBER) 문서 신청 & 다운로드 보드`}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md leading-relaxed">
              {isMaster
                ? '지사 Member가 신청한 건을 확인하고 완성된 문서 파일(PDF 등)을 첨부해 발급 완료 처리하는 리스트가 이곳에 연결됩니다.'
                : '필요한 인사 문서를 직접 신청하거나 우측 AI 봇에게 요청하고, 본사 Master가 등록해 준 문서를 내려받는 공간입니다.'}
            </p>
          </div>
        </section>

        {/* 우측 라모스 네이비 AI 에이전트 패널 틀 */}
        <aside className="lg:col-span-4">
          <div className="bg-[#0B1E3B] text-white rounded-2xl p-5 shadow-lg border border-blue-900/50 flex flex-col h-[530px] sticky top-24">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="p-2 bg-blue-600 rounded-xl shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Ramos AI 업무 비서</h3>
                <p className="text-[11px] text-blue-200/70">
                  {isMaster ? '대기 건 요약 · 일괄 상태 변경 지원' : '자연어 한 줄로 문서 신청 자동 실행'}
                </p>
              </div>
            </div>

            <div className="flex-1 py-4 text-xs text-blue-100/80 flex flex-col justify-center items-center text-center px-3">
              <p className="bg-white/10 border border-white/10 rounded-xl p-3.5 leading-relaxed">
                💬 예시 명령어:<br />
                <span className="text-white font-semibold">
                  "김민정님의 은행 제출용 재직증명서를 요청해줘"
                </span>
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <input
                type="text"
                disabled
                placeholder="다음 단계에서 AI 봇을 연결합니다..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-blue-200/40"
              />
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
