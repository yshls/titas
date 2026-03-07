import styled from '@emotion/styled';
import dayjs from 'dayjs';
import type { FSRSReviewLog } from '@/services/fsrsService';

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

const AttemptRowStyled = styled.div`
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

interface AttemptRowItemProps {
  log: FSRSReviewLog;
  onClick: (log: FSRSReviewLog) => void;
}

export function AttemptRowItem({ log, onClick }: AttemptRowItemProps) {
  return (
    <AttemptRowStyled onClick={() => onClick(log)}>
      <AttemptInfo>
        <AttemptTime>
          {dayjs(log.last_reviewed).format('HH:mm')}
        </AttemptTime>
        <AttemptLine>Line {log.line_index + 1}</AttemptLine>
      </AttemptInfo>
      <AttemptScore score={log.accuracy}>
        {log.accuracy}%
      </AttemptScore>
    </AttemptRowStyled>
  );
}

interface ScriptGroupItemProps {
  title: string;
  attempts: FSRSReviewLog[];
  onRowClick: (log: FSRSReviewLog) => void;
}

export function ScriptGroupItem({ title, attempts, onRowClick }: ScriptGroupItemProps) {
  return (
    <ScriptGroupCard>
      <ScriptGroupHeader>
        <ScriptGroupTitle>{title}</ScriptGroupTitle>
      </ScriptGroupHeader>
      <AttemptList>
        {attempts.map((log, index) => (
          <AttemptRowItem 
             key={(log as any).id || `${log.script_id}-${log.line_index}-${log.last_reviewed}-${index}`} 
             log={log} 
             onClick={onRowClick} 
          />
        ))}
      </AttemptList>
    </ScriptGroupCard>
  );
}

interface DateGroupSectionProps {
  dateLabel: string;
  scriptGroups: Record<string, FSRSReviewLog[]>;
  getScriptTitle: (log: FSRSReviewLog) => string;
  onRowClick: (log: FSRSReviewLog) => void;
}

export function DateGroupSection({
  dateLabel,
  scriptGroups,
  getScriptTitle,
  onRowClick,
}: DateGroupSectionProps) {
  return (
    <GroupContainer>
      <DateHeader>{dateLabel}</DateHeader>
      {Object.entries(scriptGroups).map(([scriptKey, attempts]) => (
        <ScriptGroupItem
          key={scriptKey}
          title={getScriptTitle(attempts[0])}
          attempts={attempts}
          onRowClick={onRowClick}
        />
      ))}
    </GroupContainer>
  );
}
