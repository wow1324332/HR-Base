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

// 시연 및 초기 접속용 프리셋 계정
export const DEMO_USERS = [
  {
    uid: 'master-hq-01',
    empNo: 'RM-1001',
    name: '인사총괄 매니저', // 아내분 직함이나 성함으로 자유롭게 변경 가능
    role: ROLES.MASTER,
    branch: '본사 HR총괄팀',
    email: 'hr.master@ramostech.co.kr',
  },
  {
    uid: 'member-bs-01',
    empNo: 'RM-2041',
    name: '김민수 대리',
    role: ROLES.MEMBER,
    branch: '부산지사 HR',
    email: 'bs.hr@ramostech.co.kr',
  },
  {
    uid: 'member-dj-01',
    empNo: 'RM-2088',
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
