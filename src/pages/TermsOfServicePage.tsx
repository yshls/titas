import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { MdArrowBack } from 'react-icons/md';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';

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
  padding: 12px;
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

  ol {
    list-style-type: decimal;
    padding-left: 20px;
    margin-bottom: 12px;
    color: #555;
  }

  li {
    margin-bottom: 4px;
  }
`;

export function TermsOfServicePage() {
  const navigate = useNavigate();
  const { language } = useAppStore();

  const seoProps =
    language === 'en'
      ? {
          title: 'Terms of Service',
          description:
            'Read the terms and conditions for using the TiTaS English shadowing and speaking practice service.',
        }
      : {
          title: '서비스 이용약관',
          description:
            'TiTaS 영어 쉐도잉 및 스피킹 연습 서비스 이용에 대한 약관을 확인하세요.',
        };

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </BackButton>
        <HeaderTitle>Terms of Service</HeaderTitle>
      </Header>

      <ContentContainer>
        <h1>서비스 이용약관</h1>

        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 TITAS(이하 '회사')가 제공하는{' '}
          <strong>영어 말하기 연습 서비스</strong>(이하 '서비스')의 이용과
          관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로
          합니다.
        </p>

        <h2>제2조 (계정 및 로그인)</h2>
        <ol>
          <li>
            본 서비스는 별도의 아이디/비밀번호 생성 없이{' '}
            <strong>구글(Google) 계정 연동</strong>을 통해 이용할 수 있습니다.
          </li>
          <li>
            회원은 본인의 구글 계정 정보를 안전하게 관리할 책임이 있으며, 계정
            관리 소홀로 인해 발생하는 문제에 대해서는 회사가 책임을 지지
            않습니다.
          </li>
        </ol>

        <h2>제3조 (서비스의 제공)</h2>
        <p>회사는 회원에게 다음과 같은 서비스를 제공합니다.</p>
        <ol>
          <li>사용자가 저장한 영어 스크립트 관리 및 열람</li>
          <li>스크립트 기반의 말하기(Speaking) 연습 및 쉐도잉 기능</li>
          <li>
            Google Cloud STT 기술을 활용한 실시간 발음/텍스트 일치 여부 확인
            (음성 파일 미저장)
          </li>
          <li>학습 이력 관리 및 리포트 제공</li>
        </ol>

        <h2>제4조 (회원의 의무)</h2>
        <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
        <ol>
          <li>타인의 구글 계정을 도용하여 서비스를 이용하는 행위</li>
          <li>회사의 저작권 및 지적재산권을 침해하는 행위</li>
          <li>서비스의 안정적인 운영을 방해하거나 해킹을 시도하는 행위</li>
          <li>불법적이거나 부적절한 내용의 스크립트를 작성 및 저장하는 행위</li>
        </ol>

        <h2>제5조 (책임의 한계)</h2>
        <p>
          본 서비스는 음성 인식 기술(STT)을 활용하여 제공되므로, 분석 결과의
          완전성이나 정확성을 100% 보장하지 않습니다. 회사는 기술적 한계로 인한
          인식 오류 등에 대해 원칙적으로 책임을 지지 않습니다.
        </p>

        <p style={{ marginTop: '40px', color: '#999', fontSize: '12px' }}>
          * 본 약관은 예시이며 실제 운영 시에는 법률 전문가의 검토가 필요합니다.
        </p>
      </ContentContainer>
    </PageContainer>
  );
}
