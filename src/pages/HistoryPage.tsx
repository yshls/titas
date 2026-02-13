import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { getAllStudyLogs } from '@/services/fsrsService';
import { MdArrowBack, MdHistory } from 'react-icons/md';
import { Seo } from '@/components/common/Seo';
import dayjs from 'dayjs';

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

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryCard = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ScriptTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 4px;
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSub};
`;

const CardStats = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  strong {
    color: ${({ theme }) => theme.textMain};
    font-weight: 600;
  }
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
  const { user, allScripts, language } = useAppStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/review');
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAllStudyLogs();
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, navigate]);

  const getScriptTitle = (scriptId: number) => {
    // script_id와 일치하는 스크립트 찾기 (타입 변환 고려)
    const script = allScripts.find((s) => String(s.id) === String(scriptId));
    return script?.title || `Script #${scriptId}`;
  };

  const seoProps =
    language === 'en'
      ? {
          title: 'Learning History',
          description: 'View your past practice sessions.',
        }
      : { title: '학습 기록', description: '지난 학습 기록을 확인하세요.' };

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </BackButton>
        <Title>Learning History</Title>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : logs.length === 0 ? (
        <EmptyState>
          <MdHistory />
          <p>No history yet. Start practicing!</p>
        </EmptyState>
      ) : (
        <HistoryList>
          {logs.map((log) => (
            <HistoryCard
              key={`${log.script_id}-${log.line_index}-${log.last_reviewed}`}
              onClick={() =>
                navigate(`/talk/${log.script_id}?line=${log.line_index}`)
              }
            >
              <CardHeader>
                <ScriptTitle>{getScriptTitle(log.script_id)}</ScriptTitle>
                <DateText>
                  {dayjs(log.last_reviewed).format('MMM D, HH:mm')}
                </DateText>
              </CardHeader>
              <CardStats>
                <StatItem>
                  Line: <strong>{log.line_index + 1}</strong>
                </StatItem>
                <StatItem>
                  Accuracy: <strong>{log.accuracy}%</strong>
                </StatItem>
                <StatItem>
                  Repetitions: <strong>{log.repetitions}</strong>
                </StatItem>
              </CardStats>
            </HistoryCard>
          ))}
        </HistoryList>
      )}
    </PageContainer>
  );
}
