
// src/components/RequestBoard.jsx
import React, { useState, useRef } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  FilePlus2,
  UploadCloud,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Trash2,
  X,
  Building2,
  Paperclip,
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { DOC_CATEGORIES, ROLES } from '../constants';

export default function RequestBoard({
  user,
  requests,
  externalFormModal,
  setExternalFormModal,
}) {
  const isMaster = user.role === ROLES.MASTER;

  // 신청 모달 상태 (AI 봇에서도 제어할 수 있도록 상위 state와 호환)
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalOpen = externalFormModal?.isOpen || localModalOpen;

  const [form, setForm] = useState({
    targetName: '',
    targetEmpNo: '',
    docType: DOC_CATEGORIES[0],
    purpose: '',
    memo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // MASTER 파일 업로드 모달 상태
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [masterComment, setMasterComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 필터 탭 상태 ('ALL' | 'PENDING' | 'COMPLETED')
  const [filter, setFilter] = useState('ALL');

  // 외부(AI 봇 등)에서 모달 오픈 요청 시 폼 동기화
  React.useEffect(() => {
    if (externalFormModal?.isOpen && externalFormModal?.prefill) {
      setForm((prev) => ({
        ...prev,
        ...externalFormModal.prefill,
      }));
    }
  }, [externalFormModal]);

  const closeRequestModal = () => {
    setLocalModalOpen(false);
    if (setExternalFormModal) {
      setExternalFormModal({ isOpen: false, prefill: null });
    }
  };

  // [MEMBER] 새 문서 신청 등록
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!form.targetName.trim() || !form.purpose.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'hr_requests'), {
        targetName: form.targetName.trim(),
        targetEmpNo: form.targetEmpNo.trim() || '미입력',
        docType: form.docType,
        purpose: form.purpose.trim(),
        memo: form.memo.trim(),
        requesterUid: user.uid,
        requesterName: user.name,
        branch: user.branch,
        status: 'PENDING', // PENDING | COMPLETED | REJECTED
        fileName: null,
        fileDataUrl: null,
        masterComment: '',
        createdAt: serverTimestamp(),
        createdAtClient: Date.now(),
      });

      setForm({
        targetName: '',
        targetEmpNo: '',
        docType: DOC_CATEGORIES[0],
        purpose: '',
        memo: '',
      });
      closeRequestModal();
    } catch (err) {
      console.error(err);
      alert('신청 저장 중 오류가 발생했습니다. Firestore 데이터베이스 생성 및 규칙을 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 파일을 Base64 DataURL로 변환 (700KB 이하 권장 - Firestore 단일 문서 1MB 제한 대응)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750 * 1024) {
      alert('시연 환경에서는 750KB 이하의 문서(PDF, 이미지, 텍스트 등)를 첨부해 주세요.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // [MASTER] 문서 파일 등록 및 발급 완료 처리
  const handleMasterIssue = async (e) => {
    e.preventDefault();
    if (!selectedReq || !selectedFile) {
      alert('발급할 문서 파일을 첨부해 주세요.');
      return;
    }

    setUploading(true);
    try {
      const ref = doc(db, 'hr_requests', selectedReq.id);
      await updateDoc(ref, {
        status: 'COMPLETED',
        fileName: selectedFile.name,
        fileDataUrl: selectedFile.dataUrl,
        masterComment: masterComment.trim() || '검토 후 정상 발급되었습니다.',
        issuedBy: user.name,
        issuedAtClient: Date.now(),
      });
      setSelectedReq(null);
      setSelectedFile(null);
      setMasterComment('');
    } catch (err) {
      console.error(err);
      alert('문서 등록 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // [MASTER] 반려 처리
  const handleReject = async (reqItem) => {
    const reason = window.prompt('반려 사유를 입력해 주세요:', '필수 확인 정보 누락으로 재신청 바랍니다.');
    if (reason === null) return;
    try {
      await updateDoc(doc(db, 'hr_requests', reqItem.id), {
        status: 'REJECTED',
        masterComment: reason,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 내역 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('이 신청 내역을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'hr_requests', id));
    } catch (err) {
      console.error(err);
    }
  };

  // 권한 및 탭 필터링 (MASTER는 전체 지사 조회, MEMBER는 본인 지사 건만 조회)
  const visibleRequests = requests
    .filter((r) => (isMaster ? true : r.branch === user.branch))
    .filter((r) => {
      if (filter === 'PENDING') return r.status === 'PENDING';
      if (filter === 'COMPLETED') return r.status === 'COMPLETED';
      return true;
    });

  const formatDate = (ms) => {
    if (!ms) return '방금 전';
    const d = new Date(ms);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* 보드 상단 헤더 & 필터/신청 버튼 */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#0B1E3B] flex items-center gap-2">
            {isMaster ? '전 지사 문서 신청 통합 관리' : `${user.branch} 문서 신청 내역`}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMaster
              ? '지사에서 접수된 신청 건을 확인하고 해당 문서 파일을 첨부해 발급 처리합니다.'
              : '신청한 문서의 실시간 처리 현황을 확인하고 발급 완료된 문서를 다운로드합니다.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 필터 버튼 */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { key: 'ALL', label: '전체' },
              { key: 'PENDING', label: '대기중' },
              { key: 'COMPLETED', label: '발급완료' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === tab.key
                    ? 'bg-white text-[#0B1E3B] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MEMBER 전용(또는 테스트용) 새 문서 신청 버튼 */}
          {!isMaster && (
            <button
              onClick={() => setLocalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>문서 신청</span>
            </button>
          )}
        </div>
      </div>

      {/* 리스트 본문 */}
      <div className="divide-y divide-slate-100 min-h-[360px]">
        {visibleRequests.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">표시할 문서 신청 내역이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">
              {isMaster
                ? '지사(MEMBER)에서 문서를 신청하면 실시간으로 이곳에 표시됩니다.'
                : '우측 상단 [문서 신청] 버튼이나 AI 업무 비서를 통해 첫 문서를 신청해 보세요!'}
            </p>
          </div>
        ) : (
          visibleRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* 좌측 신청 상세 정보 */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* 상태 배지 */}
                  {req.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> 승인·발급 대기
                    </span>
                  )}
                  {req.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3 h-3" /> 발급 완료
                    </span>
                  )}
                  {req.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3 h-3" /> 반려됨
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B1E3B] bg-slate-100 px-2 py-0.5 rounded-md">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    {req.branch}
                  </span>

                  <span className="text-sm font-extrabold text-slate-900">
                    [{req.docType}] {req.targetName}
                    {req.targetEmpNo && req.targetEmpNo !== '미입력' ? ` (${req.targetEmpNo})` : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">제출 용도:</span> {req.purpose}
                  {req.memo && <span className="text-slate-400"> · 요청메모: {req.memo}</span>}
                </p>

                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                  <span>신청담당: {req.requesterName}</span>
                  <span>·</span>
                  <span>접수일시: {formatDate(req.createdAtClient)}</span>
                  {req.masterComment && (
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                      본사 코멘트: {req.masterComment}
                    </span>
                  )}
                </div>
              </div>

              {/* 우측 권한별 액션 버튼 */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 발급 완료된 파일이 있으면 누구나 다운로드 가능 */}
                {req.status === 'COMPLETED' && req.fileDataUrl && (
                  <a
                    href={req.fileDataUrl}
                    download={req.fileName || `${req.targetName}_${req.docType}.pdf`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>문서 다운로드</span>
                  </a>
                )}

                {/* MASTER 전용: 대기 중인 건에 파일 등록 또는 반려 */}
                {isMaster && req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setSelectedFile(null);
                        setMasterComment('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1E3B] hover:bg-[#15325E] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>문서 등록·발급</span>
                    </button>
                    <button
                      onClick={() => handleReject(req)}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition cursor-pointer"
                    >
                      반려
                    </button>
                  </>
                )}

                {/* 삭제 버튼 (MASTER 또는 대기 상태인 본인 신청 건) */}
                {(isMaster || req.status === 'PENDING') && (
                  <button
                    onClick={() => handleDelete(req.id)}
                    title="내역 삭제"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* [모달 1] MEMBER 문서 신청 폼 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1E3B] text-white px-5 py-4 flex items-center justify-between">
              <h4 className="text-sm font-extrabold flex items-center gap-2">
                <FilePlus2 className="w-4 h-4 text-blue-400" />
                인사 문서 발급 신청 ({user.branch})
              </h4>
              <button onClick={closeRequestModal} className="text-blue-200 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대상 임직원 성명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 김민정"
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대상자 사번 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: RM-3042"
                    value={form.targetEmpNo}
                    onChange={(e) => setForm({ ...form, targetEmpNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">신청 문서 종류 *</label>
                <select
                  value={form.docType}
                  onChange={(e) => setForm({ ...form, docType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {DOC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">제출 용도 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 금융기관(은행) 제출용 / 관공서 제출용"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">본사 전달 메모 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 주민번호 뒷자리 마스킹 처리 부탁드립니다."
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? '접수 중...' : '본사에 발급 요청하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* [모달 2] MASTER 문서 파일 업로드 & 발급 모달 */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1E3B] text-white px-5 py-4 flex items-center justify-between">
              <h4 className="text-sm font-extrabold flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                문서 파일 등록 및 발급 완료 처리
              </h4>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMasterIssue} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-extrabold text-[#0B1E3B] text-sm">
                  [{selectedReq.docType}] {selectedReq.targetName}
                </p>
                <p className="text-slate-600">소속/요청지사: {selectedReq.branch} ({selectedReq.requesterName})</p>
                <p className="text-slate-600">제출 용도: {selectedReq.purpose}</p>
                {selectedReq.memo && <p className="text-blue-700">요청 메모: {selectedReq.memo}</p>}
              </div>

              {/* 파일 선택 영역 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  발급된 문서 파일 첨부 (PDF, 이미지, 한글 등) *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 rounded-xl p-5 text-center cursor-pointer transition"
                >
                  <Paperclip className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  {selectedFile ? (
                    <p className="text-xs font-bold text-blue-700">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-700">클릭하여 발급 완료된 문서 선택</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">선택 즉시 해당 지사에서 다운로드 가능해집니다</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  지사 전달 코멘트 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 직인 날인본 첨부해 드립니다."
                  value={masterComment}
                  onChange={(e) => setMasterComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 rounded-xl bg-[#0B1E3B] hover:bg-[#15325E] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-40"
                >
                  {uploading ? '파일 등록 중...' : '문서 등록 및 발급 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
