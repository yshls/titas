import { useEffect, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { getAllStudyLogs, type FSRSReviewLog } from '@/services/fsrsService';
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

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DateHeader = styled.h2`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.textSub};
  margin: 12px 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ScriptGroupCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
`;

const ScriptGroupHeader = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const ScriptGroupTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  line-height: 1.4;
`;

const AttemptList = styled.div`
  display: flex;
  flex-direction: column;
`;

const AttemptRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.background};
  }
`;

const AttemptInfo = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AttemptTime = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
  font-variant-numeric: tabular-nums;
  width: 60px;
`;

const AttemptLine = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.textMain};
  background: ${({ theme }) => theme.border};
  padding: 2px 8px;
  border-radius: 6px;
`;

const AttemptScore = styled.span<{ score: number }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ score, theme }) =>
    score >= 90
      ? theme.colors.success
      : score >= 70
        ? theme.colors.primary
        : theme.colors.error};
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
  const [logs, setLogs] = useState<FSRSReviewLog[]>([]);
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
        
       
        const validLogs = data.filter(
          (log) =>
            (log.script_id != null || (log as any).script_title) &&
            log.last_reviewed,
        );
        setLogs(validLogs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, navigate]);

  const scriptTitleMap = useMemo(
    () => new Map(allScripts.map((s) => [String(s.id), s.title])),
    [allScripts],
  );

  const groupedLogs = useMemo(() => {
    const groups: Record<string, Record<string, FSRSReviewLog[]>> = {};

    logs.forEach((log) => {
      const date = dayjs(log.last_reviewed);
      const today = dayjs();
      const yesterday = dayjs().subtract(1, 'day');

      let dateLabel = date.format('MMMM D, YYYY');
      if (date.isSame(today, 'day')) dateLabel = 'Today';
      if (date.isSame(yesterday, 'day')) dateLabel = 'Yesterday';

      if (!groups[dateLabel]) {
        groups[dateLabel] = {};
      }

      
      const scriptKey =
        String(log.script_id) || (log as any).script_title || 'Unknown';
      if (!groups[dateLabel][scriptKey]) {
        groups[dateLabel][scriptKey] = [];
      }
      groups[dateLabel][scriptKey].push(log);
    });

    return groups;
  }, [logs]);

  const getScriptTitle = (log: FSRSReviewLog) => {
    if (log.script_id) {
      return (
        scriptTitleMap.get(String(log.script_id)) || `Script #${log.script_id}`
      );
    }
    return (log as any).script_title || 'Unknown Script';
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
        <HistoryList>

          {Object.entries(groupedLogs).map(([dateLabel, scriptGroups]) => (
            <GroupContainer key={dateLabel}>
              <DateHeader>{dateLabel}</DateHeader>
              {Object.entries(scriptGroups).map(([scriptKey, attempts]) => (
                <ScriptGroupCard key={scriptKey}>
                  <ScriptGroupHeader>
                    <ScriptGroupTitle>
                      {getScriptTitle(attempts[0])}
                    </ScriptGroupTitle>
                  </ScriptGroupHeader>
                  <AttemptList>
                    {attempts.map((log, index) => (
                      <AttemptRow
                        key={
                          (log as any).id ||
                          `${log.script_id}-${log.line_index}-${log.last_reviewed}-${index}`
                        }
                        onClick={() => {
                          let targetId = log.script_id;
                          if (!targetId && (log as any).script_title) {
                            const foundScript = allScripts.find(
                              (s) => s.title === (log as any).script_title,
                            );
                            if (foundScript) targetId = Number(foundScript.id);
                          }

                          if (targetId) {
                            navigate(
                              `/talk/${targetId}?line=${log.line_index}`,
                            );
                          } else {
                            console.warn('Cannot find script ID for log:', log);
                          }
                        }}
                      >
                        <AttemptInfo>
                          <AttemptTime>
                            {dayjs(log.last_reviewed).format('HH:mm')}
                          </AttemptTime>
                          <AttemptLine>Line {log.line_index + 1}</AttemptLine>
                        </AttemptInfo>
                        <AttemptScore score={log.accuracy}>
                          {log.accuracy}%
                        </AttemptScore>
                      </AttemptRow>
                    ))}
                  </AttemptList>
                </ScriptGroupCard>
              ))}
            </GroupContainer>
          ))}
        </HistoryList>
      )}
    </PageContainer>
  );
}
