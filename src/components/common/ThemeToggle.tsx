import styled from '@emotion/styled';
import { useAppStore } from '@/store/appStore';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { motion } from 'framer-motion';

const ToggleButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSub};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMain};
  }
`;

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useAppStore();

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ToggleButton
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle Dark Mode"
    >
      {themeMode === 'light' ? (
        <MdDarkMode size={22} />
      ) : (
        <MdLightMode size={22} />
      )}
    </ToggleButton>
  );
}
