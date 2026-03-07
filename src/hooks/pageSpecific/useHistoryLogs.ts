import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import { getAllStudyLogs, type FSRSReviewLog } from '@/services/fsrsService';

export function useHistoryLogs() {
  const navigate = useNavigate();
  const { user, allScripts } = useAppStore();

  // 비로그인 시 리다이렉트
  useEffect(() => {
    if (!user) {
      navigate('/review');
    }
  }, [user, navigate]);

  // React Query를 활용한 히스토리 패칭 및 캐싱
  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: ['historyLogs', user?.id],
    queryFn: async () => {
      const data = await getAllStudyLogs();
      return data.filter(
        (log) =>
          (log.script_id != null || (log as any).script_title) &&
          log.last_reviewed,
      );
    },
    enabled: !!user,
  });

  const scriptTitleMap = useMemo(
    () => new Map(allScripts.map((s) => [String(s.id), s.title])),
    [allScripts],
  );

  const getScriptTitle = (log: FSRSReviewLog) => {
    if (log.script_id) {
      return scriptTitleMap.get(String(log.script_id)) || `Script #${log.script_id}`;
    }
    return (log as any).script_title || 'Unknown Script';
  };

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

      const scriptKey = String(log.script_id) || (log as any).script_title || 'Unknown';
      if (!groups[dateLabel][scriptKey]) {
        groups[dateLabel][scriptKey] = [];
      }
      groups[dateLabel][scriptKey].push(log);
    });

    return groups;
  }, [logs]);

  const handleRowClick = (log: FSRSReviewLog) => {
    let targetId = log.script_id;
    if (!targetId && (log as any).script_title) {
      const foundScript = allScripts.find(
        (s) => s.title === (log as any).script_title,
      );
      if (foundScript) targetId = Number(foundScript.id);
    }

    if (targetId) {
      navigate(`/talk/${targetId}?line=${log.line_index}`);
    } else {
      console.warn('Cannot find script ID for log:', log);
    }
  };

  return {
    loading,
    logs,
    groupedLogs,
    getScriptTitle,
    handleRowClick,
  };
}
