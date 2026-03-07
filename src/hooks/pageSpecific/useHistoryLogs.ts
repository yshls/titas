import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { getAllStudyLogs, type FSRSReviewLog } from '@/services/fsrsService';

export function useHistoryLogs() {
  const navigate = useNavigate();
  const { user, allScripts } = useAppStore();
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
