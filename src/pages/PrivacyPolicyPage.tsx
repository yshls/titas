import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { MdArrowBack } from 'react-icons/md';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.background || '#fcfcfc'};
  font-family: 'lato', sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const BackButton = styled.button`
  padding: 8px;
  margin-left: -8px;
  border-radius: 50%;
  color: #333;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const HeaderTitle = styled.span`
  font-weight: 700;
  font-size: 17px;
  color: #333;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  color: #333;
  line-height: 1.6;
  font-size: 14px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-top: 24px;
    margin-bottom: 12px;
    color: #1a1a1a;
  }

  p {
    margin-bottom: 12px;
    color: #555;
  }

  ul {
    list-style-type: disc;
    padding-left: 20px;
    margin-bottom: 12px;
    color: #555;
  }

  li {
    margin-bottom: 4px;
  }
`;

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </BackButton>
        <HeaderTitle>Privacy Policy</HeaderTitle>
      </Header>

      <ContentContainer>
        <h1>개인정보 처리방침</h1>
        <p>
          TITAS(이하 '회사')는 구글 로그인(Google OAuth)을 기반으로 서비스를
          제공하며, 회원의 개인정보를 소중히 다루고 있습니다.
        </p>

        <h2>제1조 (수집하는 개인정보 항목)</h2>
        <p>
          회사는 서비스 이용을 위해 구글(Google)로부터 다음과 같은 최소한의
          정보를 제공받아 수집합니다.
        </p>
        <ul>
          <li>
            필수항목: 구글 계정 이메일(Email), 이름(Name), 프로필 사진 URL
          </li>
        </ul>
        <p>
          ※ 별도의 회원가입 절차 없이 구글 계정 연동만으로 서비스를 이용하게
          되며, 서비스 이용에 불필요한 정보는 수집하지 않습니다.
        </p>

        <h2>제2조 (개인정보의 수집 및 이용목적)</h2>
        <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
        <ul>
          <li>회원 식별 및 로그인 관리 (구글 계정 연동)</li>
          <li>사용자가 저장한 스크립트 및 학습 기록 관리</li>
        </ul>

        <h2>제3조 (음성 데이터의 처리 및 미저장 원칙)</h2>
        <p>
          본 서비스는{' '}
          <strong>사용자가 저장한 스크립트를 기반으로 한 말하기 연습</strong>을
          위해 음성 정보를 활용하며, 다음과 같은 원칙을 준수합니다.
        </p>
        <ul>
          <li>
            <strong>Google Cloud STT 활용:</strong> 사용자의 음성 데이터는 발음
            정확도 확인 및 텍스트 변환(Speech-to-Text)을 위해{' '}
            <strong>Google Cloud STT</strong> 서비스로만 전송됩니다.
          </li>
          <li>
            <strong>저장 안 함:</strong> 회사는 사용자의{' '}
            <strong>음성 파일(녹음 원본)을 서버에 저장하지 않습니다.</strong>{' '}
            텍스트 변환 및 분석이 완료된 즉시 해당 데이터는 메모리에서
            소멸(파기)되며, 별도의 DB나 스토리지에 보관되지 않습니다.
          </li>
        </ul>

        <h2>제4조 (개인정보의 보유 및 이용기간)</h2>
        <p>
          이용자의 개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 단,
          관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안
          보관합니다.
        </p>

        <h2>제5조 (회원 탈퇴 및 정보 파기)</h2>
        <p>
          이용자는 언제든지 설정 메뉴 또는 구글 계정 관리를 통해 서비스 연동을
          해제(회원 탈퇴)할 수 있으며, 이 경우 회사가 보유한 회원의 스크립트 및
          학습 기록 등 모든 데이터는 즉시 삭제됩니다.
        </p>

        <p style={{ marginTop: '40px', color: '#999', fontSize: '12px' }}>
          * 본 방침은 예시이며, 실제 배포 전 반드시 법률 전문가의 검토를
          받으시기 바랍니다.
        </p>
      </ContentContainer>
    </PageContainer>
  );
}
