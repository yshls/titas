import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/store/appStore';
import type { Mission } from '@/utils/types';
import {
  fetchMissions,
  addMissionToDB,
  toggleMissionInDB,
  deleteMissionFromDB,
} from '@/services/dbService';

export function useMissions(selectedDate: Date) {
  const user = useAppStore((state) => state.user);
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [newTask, setNewTask] = useState('');

  // 선택된 날짜의 미션 로드
  useEffect(() => {
    const loadMissions = async () => {
      if (user) {
        const data = await fetchMissions(selectedDate.getTime());
        setTasks(data);
      } else {
        setTasks([]);
      }
    };
    loadMissions();
  }, [user, selectedDate]);

  // 미션 추가 핸들러
  const addTask = async () => {
    if (!newTask.trim()) return;
    if (!user) {
      toast.error('You need to be logged in to add a mission.');
      return;
    }
    const savedTask = await addMissionToDB(newTask, selectedDate);
    if (savedTask) {
      setTasks((prev) => [...prev, savedTask]);
      setNewTask('');
    }
  };

  // 미션 완료/미완료 토글
  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t)),
    );
    await toggleMissionInDB(id, !currentStatus);

    // 완료 시 축하 효과
    if (!currentStatus) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success('Mission completed!');
    }
  };

  // 미션 삭제 로직 (Toast 컨펌은 UI단에서 호출하기 위해 분리)
  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteMissionFromDB(id);
    toast.success('Mission deleted.');
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
