// src/constants.js

export const COMPANY_INFO = {
  name: 'Ramos Technology',
  koName: '라모스 테크놀러지',
  appName: 'HR Base',
  subTitle: '전사 인사행정 통합 허브 & AI 스마트 문서 데스크',
};

// 권한 구분 상수
export const ROLES = {
  MASTER: 'MASTER', // 본사 총괄 (신청 확인 + 실제 문서 파일 업로드/발급 + 계정 승인)
  MEMBER: 'MEMBER', // 지사 담당자 (문서 신청 + 발급 완료 문서 다운로드)
};

// 기본 등록 계정 (아내분 MASTER 계정 + 발표 시연용 MEMBER 계정)
export const DEMO_USERS = [
  {
    uid: 'master-aminos',
    empNo: 'aminos',        // 로그인 ID
    password: '1324332',    // 로그인 PW
    name: 'HR 총괄 매니저', // 필요 시 아내분 성함/직함으로 변경 가능
    role: ROLES.MASTER,
    branch: '본사 HR총괄팀',
    email: 'aminos@ramostech.co.kr',
  },
  {
    uid: 'member-bs-01',
    empNo: 'RM-2041',
    password: '1234',
    name: '김민수 대리',
    role: ROLES.MEMBER,
    branch: '부산지사 HR',
    email: 'bs.hr@ramostech.co.kr',
  },
  {
    uid: 'member-dj-01',
    empNo: 'RM-2088',
    password: '1234',
    name: '이지은 사원',
    role: ROLES.MEMBER,
    branch: '대전연구소 HR',
    email: 'dj.hr@ramostech.co.kr',
  },
];

// 기본 신청 가능 문서 목록
export const DOC_CATEGORIES = [
  '재직증명서',
  '경력증명서',
  '원천징수영수증',
  '인사발령 공문',
  '기타 인사서류',
];
