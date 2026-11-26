// src/components/LoadingTransition.jsx
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { COMPANY_INFO, ROLES } from '../constants';

export default function LoadingTransition({ user, onComplete }) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(65), 700);
    const t2 = setTimeout(() => setProgress(100), 2100);
    const t3 = setTimeout(() => onComplete(), 2800); // 약 2.8초 후 메인 보드 진입

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const isMaster = user?.role === ROLES.MASTER;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#071120] text-white overflow-hidden select-none">
      {/* /public/board-loading-bg.jpg 배경 연동 */}
      <img
        src="/board-loading-bg.jpg"
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 w-full h-full object-cover opacity-25 scale-105 animate-pulse pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071120]/90 via-[#0F264A]/80 to-[#071120]/95 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{COMPANY_INFO.name} · {COMPANY_INFO.appName}</span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          환영합니다, {user?.name}님
        </h2>
        <p className="text-xs text-blue-200/75 mt-2">
          {isMaster
            ? '전 지사 문서 요청 대기열 및 Master 승인 워크스페이스를 불러오는 중입니다...'
            : `${user?.branch} 전용 문서 신청 데스크 및 AI 비서를 연결하는 중입니다...`}
        </p>

        {/* 프로그레스 바 */}
        <div className="mt-7 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[11px] text-blue-300/60 font-mono">
          <span>ROLE: {user?.role}</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
