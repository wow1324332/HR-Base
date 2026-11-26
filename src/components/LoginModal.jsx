// src/components/LoginModal.jsx
import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, LogIn, Download, Sparkles, CheckCircle2, Lock, User } from 'lucide-react';
import { COMPANY_INFO, DEMO_USERS, ROLES } from '../constants';

export default function LoginModal({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [empNo, setEmpNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 계정 신청 폼 상태
  const [regForm, setRegForm] = useState({ name: '', branch: '', empNo: '' });
  const [regSubmitted, setRegSubmitted] = useState(false);

  // PWA 설치 프롬프트 상태
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('이미 앱이 설치되어 있거나 현재 브라우저 환경에서 바로가기를 지원합니다.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // 사번 로그인 처리
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!empNo.trim()) {
      setErrorMsg('사번을 입력해 주세요.');
      return;
    }
    const found = DEMO_USERS.find(
      (u) => u.empNo.toLowerCase() === empNo.trim().toLowerCase()
    );
    if (!found) {
      setErrorMsg('등록되지 않은 사번입니다. 아래 시연 계정을 이용해 보세요.');
      return;
    }
    onLoginSuccess(found, rememberMe);
  };

  // 지사 Member 계정 가입 승인 요청 (시연용 UI)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.branch || !regForm.empNo) return;
    setRegSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0A1628] px-4 select-none">
      {/* 와이드 시네마틱 배경 (/public/login-bg.jpg 존재 시 자동 노출) */}
      <img
        src="/login-bg.jpg"
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000 pointer-events-none"
      />
      {/* 라모스 테크놀러지 딥 네이비 & 블루 비네팅 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#071120] via-[#0D2142]/85 to-[#1D4ED8]/30 pointer-events-none" />

      {/* 상단 브랜드 워터마크 타이틀 (공간감 강조) */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-[11px] font-semibold tracking-wider uppercase mb-2 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-blue-400" />
          {COMPANY_INFO.name}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {COMPANY_INFO.appName}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100/70 mt-1 font-light">
          {COMPANY_INFO.subTitle}
        </p>
      </div>

      {/* 중앙 컴팩트 화이트 모달 (QA Base 컨셉) */}
      <div className="relative z-10 w-full max-w-[400px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/60 overflow-hidden">
        
        {/* 상단 탭 (로그인 / 지사 계정 신청) */}
        <div className="grid grid-cols-2 bg-slate-100/90 p-1.5 m-4 mb-2 rounded-xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#0F264A] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegSubmitted(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#0F264A] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            지사 계정 신청
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          {activeTab === 'login' ? (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    사번 (Employee ID)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={empNo}
                      onChange={(e) => {
                        setEmpNo(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="RM-1001"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* 로그인 기억하기 & PWA 설치 버튼 */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">로그인 상태 유지</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    앱 설치(PWA)
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-2 rounded-lg">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#0F264A] to-[#1D4ED8] hover:from-[#0A1B36] hover:to-[#1E40AF] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-900/20 transition cursor-pointer"
                >
                  HR Base 접속하기
                </button>
              </form>

              {/* 발표 시연용 빠른 권한 접속 버튼 (게스트 로그인 대체) */}
              <div className="mt-5 pt-4 border-t border-slate-200/80">
                <p className="text-[11px] font-bold text-slate-400 text-center mb-2.5">
                  ⚡ 발표 시연용 원클릭 권한 접속
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onLoginSuccess(DEMO_USERS[0], rememberMe)}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-left transition group cursor-pointer"
                  >
                    <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#0F264A] text-white mb-1">
                      MASTER
                    </span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800">
                      본사 HR 총괄
                    </p>
                    <p className="text-[10px] text-slate-500">접수 확인 · 문서 등록</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLoginSuccess(DEMO_USERS[1], rememberMe)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition group cursor-pointer"
                  >
                    <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white mb-1">
                      MEMBER
                    </span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      부산지사 HR
                    </p>
                    <p className="text-[10px] text-slate-500">AI 신청 · 문서 수령</p>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 지사 Member 계정 생성 신청 탭 (Master 승인 대기 구조) */
            <div>
              {regSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">계정 승인 요청이 접수되었습니다</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    본사 HR 총괄(<strong className="text-slate-700">MASTER</strong>) 승인 완료 후<br />
                    신청하신 사번으로 즉시 로그인이 가능합니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">
                    각 지사 HR 담당자 전용 <strong className="text-blue-700">MEMBER</strong> 권한 신청 양식입니다. 본사 Master 승인 후 활성화됩니다.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">소속 지사명</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 광주호남지사 HR"
                      value={regForm.branch}
                      onChange={(e) => setRegForm({ ...regForm, branch: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">담당자 성명</label>
                      <input
                        type="text"
                        required
                        placeholder="홍길동"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">사번</label>
                      <input
                        type="text"
                        required
                        placeholder="RM-3012"
                        value={regForm.empNo}
                        onChange={(e) => setRegForm({ ...regForm, empNo: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-[#0F264A] hover:bg-[#163566] text-white text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    Master에게 권한 승인 요청
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 카피라이트 & 보안 문구 */}
      <div className="relative z-10 mt-6 flex items-center gap-1.5 text-[11px] text-blue-200/60">
        <Shield className="w-3.5 h-3.5 text-blue-400" />
        <span>© 2026 {COMPANY_INFO.name} ({COMPANY_INFO.koName}). Authorized HR Personnel Only.</span>
      </div>
    </div>
  );
}
