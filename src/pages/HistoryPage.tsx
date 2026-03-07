import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdHistory } from 'react-icons/md';
import { useAppStore } from '@/store/appStore';
import { Seo } from '@/components/common/Seo';
import { useHistoryLogs } from '@/hooks/pageSpecific/useHistoryLogs';
import { DateGroupSection } from '@/components/History/HistoryListComponents';

const PageContainer = styled.div`
  padding: 20px 12px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textMain};
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSub};

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.border};
  }
`;

export function HistoryPage() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  
  // Custom Hook 호출로 모든 비즈니스 로직 은닉
  const { 
    loading, 
    logs, 
    groupedLogs, 
    getScriptTitle, 
    handleRowClick 
  } = useHistoryLogs();

  const seoProps = language === 'en'
    ? { title: 'Learning History', description: 'View your past practice sessions.' }
    : { title: '학습 기록', description: '지난 학습 기록을 확인하세요.' };

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </BackButton>
        <Title>{seoProps.title}</Title>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : logs.length === 0 ? (
        <EmptyState>
          <MdHistory />
          <p>No history yet. Start practicing!</p>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(groupedLogs).map(([dateLabel, scriptGroups]) => (
            <DateGroupSection
              key={dateLabel}
              dateLabel={dateLabel}
              scriptGroups={scriptGroups}
              getScriptTitle={getScriptTitle}
              onRowClick={handleRowClick}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
