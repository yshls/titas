import styled from '@emotion/styled';
import { MdCheck, MdDeleteOutline } from 'react-icons/md';
import toast from 'react-hot-toast';
import type { Mission } from '@/utils/types';
import { useAuth } from '@/hooks/common/useAuth';

// 스타일 컴포넌트
const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 16px;
`;

const SectionDate = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  font-weight: 500;
`;

const EmptyStateCard = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const EmptyTitle = styled.h4`
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.textMain};
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSub};
  margin: 0 0 8px;
  line-height: 1.5;
`;

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyTask = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSub};
  font-size: 14px;
`;

const TaskItemWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  gap: 12px;
  position: relative;

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const Checkbox = styled.button<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid ${({ theme }) => theme.textSub};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ checked, theme }) => (checked ? theme.textMain : 'transparent')};
  border-color: ${({ checked, theme }) => (checked ? theme.textMain : theme.textSub)};
  color: ${({ theme }) => theme.background};
  transition: all 0.2s;
  cursor: pointer;
`;

const TaskText = styled.span<{ checked?: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.textMain};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  flex: 1;
`;

const DeleteButton = styled.button`
  opacity: 0;
  color: ${({ theme }) => theme.colors.error};
  transition: opacity 0.2s;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.red50};
    border-radius: 4px;
  }
`;

const TaskInputWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.border};
  padding: 8px;
  border-radius: 16px;
`;

const TaskInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 4px 12px;
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.textMain};
  &::placeholder {
    color: ${({ theme }) => theme.textSub};
  }
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 6px 18px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const ToastButton = styled.button<{ variant?: 'danger' | 'cancel' }>`
  flex: 1;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  transition: opacity 0.2s;

  &:hover { opacity: 0.9; }

  ${({ theme, variant }) => variant === 'danger'
    ? `background: ${theme.colors.error}; color: white;`
    : `background: ${theme.border}; color: ${theme.textMain};`}
`;

// --- Components ---

interface MissionManagerProps {
  user: any;
  dateStr: string;
  tasks: Mission[];
  newTask: string;
  setNewTask: (val: string) => void;
  addTask: () => void;
  toggleTask: (id: string, current: boolean) => void;
  deleteTask: (id: string) => void;
}

export function MissionManager({
  user,
  dateStr,
  tasks,
  newTask,
  setNewTask,
  addTask,
  toggleTask,
  deleteTask,
}: MissionManagerProps) {
  const { loginWithGoogle } = useAuth();

  const confirmDelete = (id: string) => {
    toast.custom(
      (t) => (
        <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Are you sure you want to delete?</span>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <ToastButton variant="danger" onClick={() => { deleteTask(id); toast.dismiss(t.id); }}>
              Delete
            </ToastButton>
            <ToastButton variant="cancel" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </ToastButton>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  };

  return (
    <Column>
      <SectionTitle>
        Daily Missions <SectionDate>({dateStr})</SectionDate>
      </SectionTitle>

      {!user ? (
        <EmptyStateCard>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyTitle>Daily Missions Available</EmptyTitle>
          <EmptyText>Track your daily goals and stay motivated with personalized missions</EmptyText>
          <LoginButton onClick={loginWithGoogle}>Login to Start</LoginButton>
        </EmptyStateCard>
      ) : (
        <>
          <TaskList>
            {tasks.length === 0 && <EmptyTask>No missions for this day. Plan ahead!</EmptyTask>}
            {tasks.map((task) => (
              <TaskItemWrapper key={task.id}>
                <Checkbox checked={task.completed} onClick={() => toggleTask(task.id, task.completed)}>
                  {task.completed && <MdCheck size={14} />}
                </Checkbox>
                <TaskText checked={task.completed}>{task.text}</TaskText>
                <DeleteButton className="delete-btn" onClick={() => confirmDelete(task.id)}>
                  <MdDeleteOutline size={18} />
                </DeleteButton>
              </TaskItemWrapper>
            ))}
          </TaskList>

          <TaskInputWrapper>
            <TaskInput
              placeholder="Add a new mission..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <AddButton onClick={addTask}>Add</AddButton>
          </TaskInputWrapper>
        </>
      )}
    </Column>
  );
}
