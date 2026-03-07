import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import type { Mission } from '@/utils/types';
import {
  fetchMissions,
  addMissionToDB,
  toggleMissionInDB,
  deleteMissionFromDB,
} from '@/services/dbService';
import { useState } from 'react';

export function useMissions(selectedDate: Date) {
  const user = useAppStore((state) => state.user);
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState('');

  // 쿼리 키 정의
  const dateKey = selectedDate.toISOString().split('T')[0];
  const queryKey = ['missions', dateKey, user?.id];

  // 1. 자동 페칭 (useQuery)
  const { data: tasks = [] } = useQuery({
    queryKey,
    queryFn: () => fetchMissions(selectedDate.getTime()),
    enabled: !!user, // 로그인 상태일 때만 실행
  });

  // 2. 미션 추가 (useMutation)
  const addMutation = useMutation({
    mutationFn: (text: string) => addMissionToDB(text, selectedDate),
    onSuccess: (savedTask) => {
      if (savedTask) {
        queryClient.setQueryData(queryKey, (old: Mission[] = []) => [...old, savedTask]);
        setNewTask(''); // 입력창 비우기
      }
    },
    onError: () => toast.error('Failed to add mission.'),
  });

  const addTask = () => {
    if (!newTask.trim()) return;
    if (!user) {
      toast.error('You need to be logged in to add a mission.');
      return;
    }
    addMutation.mutate(newTask);
  };

  // 3. 미션 상태 토글 (Optimistic Update 적용)
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleMissionInDB(id, completed),
    
    // 낙관적 업데이트 시작
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData(queryKey) as Mission[];

      // 캐시 강제 변경
      queryClient.setQueryData(queryKey, (old: Mission[] = []) =>
        old.map((t) => (t.id === id ? { ...t, completed } : t))
      );

      // 성공 시 축하 알림 (오직 미완료 -> 완료 로 바뀔 때만)
      if (completed) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success('Mission completed!');
      }

      return { previousTasks };
    },
    // 에러 발생 시 롤백
    onError: (_err: any, _variables: { id: string; completed: boolean }, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error('앗, 오류가 발생했어요. 다시 시도해 주세요.');
    },
    // 항상 최신 상태 다시 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleTask = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, completed: !currentStatus });
  };

  // 4. 미션 삭제 (Optimistic Update 적용)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMissionFromDB(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData(queryKey) as Mission[];
      
      queryClient.setQueryData(queryKey, (old: Mission[] = []) => 
        old.filter((t) => t.id !== id)
      );

      toast.success('Mission deleted.');
      return { previousTasks };
    },
    onError: (_err: any, _id: string, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
      toast.error('Failed to delete mission.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteTask = (id: string) => {
    deleteMutation.mutate(id);
  };

  return {
    tasks,
    newTask,
    setNewTask,
    addTask,
    toggleTask,
    deleteTask,
  };
}
