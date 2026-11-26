// src/components/LoginModal.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Shield, UserPlus, LogIn, Download, CheckCircle2, Lock, User } from 'lucide-react';
import { db } from '../firebaseConfig';
import { COMPANY_INFO, DEMO_USERS } from '../constants';

export default function LoginModal({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 지사 Member 계정 신청 폼 상태
  const [regForm, setRegForm] = useState({
    name: '',
    branch: '',
    empNo: '',
    password: '',
  });
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
      alert('이미 앱이 설치되어 있거나 현재 브라우저 메뉴에서 홈 화면 추가를 지원합니다.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // ID / 비밀번호 검증 로그인 처리
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = loginId.trim();
    const trimmedPw = password.trim();

    if (!trimmedId || !trimmedPw) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1) 기본 등록 계정(aminos 마스터 계정 및 기본 시연 계정) 우선 확인
      const presetUser = DEMO_USERS.find(
        (u) => u.empNo.toLowerCase() === trimmedId.toLowerCase()
      );

      if (presetUser) {
        if (presetUser.password !== trimmedPw) {
          setErrorMsg('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        onLoginSuccess(presetUser, rememberMe);
        return;
      }

      // 2) Firestore(hr_users)에 가입 신청된 지사 Member 계정 확인
      const q = query(
        collection(db, 'hr_users'),
        where('empNo', '==', trimmedId)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setErrorMsg('존재하지 않는 아이디입니다.');
        setLoading(false);
        return;
      }

      const userDoc = snap.docs[0].data();
      if (userDoc.password !== trimmedPw) {
        setErrorMsg('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      if (userDoc.status === 'PENDING') {
        setErrorMsg('본사 MASTER 승인 대기 중인 계정입니다.');
        setLoading(false);
        return;
      }

      onLoginSuccess({ uid: snap.docs[0].id, ...userDoc }, rememberMe);
    } catch (err) {
      console.error(err);
      setErrorMsg('로그인 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 지사 Member 계정 가입 승인 요청 (Firestore 저장)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.branch || !regForm.empNo || !regForm.password) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'hr_users'), {
        empNo: regForm.empNo.trim(),
        password: regForm.password.trim(),
        name: regForm.name.trim(),
        branch: regForm.branch.trim(),
        role: 'MEMBER',
        status: 'PENDING', // MASTER 승인 전 대기 상태
        createdAt: serverTimestamp(),
      });
      setRegSubmitted(true);
      setRegForm({ name: '', branch: '', empNo: '', password: '' });
    } catch (err) {
      console.error(err);
      alert('계정 신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#071120] px-4 select-none">
      {/* 와이드 시네마틱 배경 */}
      <img
        src="/Appmain-bg.webp"
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#071120]/70 via-[#0D2142]/40 to-transparent pointer-events-none" />

      {/* 화면 우측 상단 앱 설치 버튼 */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-blue-300" />
        앱 설치(PWA)
      </button>

      {/* 상단 브랜드 타이틀 */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {COMPANY_INFO.appName}
        </h1>
      </div>

      {/* 중앙 컴팩트 화이트 모달 */}
      <div className="relative z-10 w-full max-w-[400px] h-[360px] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/60 overflow-hidden">
        {/* 상단 탭 */}
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
            계정 신청
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
          {activeTab === 'login' ? (
            <>
              <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="아이디 입력"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">로그인 상태 유지</span>
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-auto py-2.5 bg-gradient-to-r from-[#0F264A] to-[#1D4ED8] hover:from-[#0A1B36] hover:to-[#1E40AF] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-900/20 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? '인증 확인 중...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            /* 지사 Member 계정 생성 신청 탭 */
            <div className="flex-1 flex flex-col">
              {regSubmitted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">계정 승인 요청이 접수되었습니다</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    본사 HR 총괄(<strong className="text-slate-700">MASTER</strong>) 승인 완료 후<br />
                    신청하신 아이디로 즉시 로그인이 가능합니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="flex-1 flex flex-col gap-2.5 pt-1">
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
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">사용할 아이디</label>
                      <input
                        type="text"
                        required
                        placeholder="예: gj_hr01"
                        value={regForm.empNo}
                        onChange={(e) => setRegForm({ ...regForm, empNo: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">비밀번호 설정</label>
                    <input
                      type="password"
                      required
                      placeholder="비밀번호 입력"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-auto py-2.5 bg-[#0F264A] hover:bg-[#163566] text-white text-sm font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? '요청 전송 중...' : 'Master에게 권한 승인 요청'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-1.5 text-[11px] text-blue-200/60">
        <Shield className="w-3.5 h-3.5 text-blue-400" />
        <span>© 2026 {COMPANY_INFO.name} ({COMPANY_INFO.koName}). Authorized HR Personnel Only.</span>
      </div>
    </div>
  );
}
