import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import type { ScriptData } from '@/utils/types';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import {
  MdLibraryBooks,
  MdDelete,
  MdNotes,
  MdPlayArrow,
  MdSort,
  MdCheck,
  MdExpandMore,
  MdCloudDone,
  MdSearch,
  MdClose,
  MdVisibility,
  MdUploadFile,
} from 'react-icons/md';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/common/Seo';
import { supabase } from '../supabaseClient';
import { generateUUID } from '@/utils/uuid';
import { parseScriptFile } from '@/utils/scriptFileParser';

const SORT_OPTIONS = [
  { value: 'date-desc', labelKey: 'scripts.sortNewest' },
  { value: 'date-asc', labelKey: 'scripts.sortOldest' },
  { value: 'title-asc', labelKey: 'scripts.sortTitleAsc' },
  { value: 'title-desc', labelKey: 'scripts.sortTitleDesc' },
];

// --- 스타일 컴포넌트 ---

const PageContainer = styled.div`
  padding: 12px;
  min-height: 100vh;
  min-height: 100dvh;
  font-family: 'lato', sans-serif;
  background-color: ${({ theme }) => theme.background};
  transition: background-color 0.3s ease;

  @media (min-width: 1024px) {
    padding: 8px;
  }

  @media (max-height: 800px) {
    padding: 8px;
  }
`;

const Header = styled.header`
  margin-bottom: clamp(12px, 2vh, 24px);
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.textMain};
  text-transform: uppercase;
  white-space: nowrap;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  width: 100%;

  @media (min-width: 768px) {
    justify-content: flex-end;
    width: auto;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 36px 10px 12px;
  border-radius: 8px;
  /* 지정하지 않으면 브라우저 기본 테두리(2px inset)가 그대로 보인다. */
  border: none;
  background-color: ${({ theme }) => theme.cardBg};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textMain};
  transition: all 0.2s;

  &:focus {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textDisabled};
  }
`;

const SearchIcon = styled(MdSearch)`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.textSub};
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSub};
  padding: 2px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  background: transparent;

  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMain};
  }
`;

// 정렬 메뉴 래퍼
const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SortWrapper = styled.div`
  position: relative;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: ${({ theme }) => theme.textMain};
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  background-color: ${({ theme }) => theme.cardBg};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

// 회전하는 아이콘
const AnimatedExpandIcon = styled(MdExpandMore, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const SortMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  width: 180px;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  z-index: 20;
  padding: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
`;

const SortOption = styled.button<{ isActive: boolean }>`
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ isActive, theme }) =>
    isActive ? theme.textMain : theme.textSub};
  border-radius: 8px;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.border : 'transparent'};
  border: none;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textMain};
  }
`;

const EmptyStateContainer = styled.section`
  text-align: center;
  padding: 40px 20px;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${({ theme }) => theme.border};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.textDisabled};
`;

const EmptyTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSub};
  margin-bottom: 32px;
  max-width: 320px;
  line-height: 1.5;
`;

const CreateButton = styled.button<{ isLoggedIn: boolean }>`
  padding: 10px 24px;
  font-weight: 700;
  border-radius: 10px;
  text-transform: uppercase;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  background-color: ${({ isLoggedIn, theme }) =>
    isLoggedIn ? theme.colors.primary : theme.border};
  color: ${({ isLoggedIn, theme }) =>
    isLoggedIn ? theme.colors.onPrimary : theme.textSub};

  &:hover {
    background-color: ${({ isLoggedIn, theme }) =>
      isLoggedIn ? theme.colors.primaryHover : theme.textDisabled};
    transform: translateY(-1px);
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// 검색 결과 없음 컨테이너
const NoResultsContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.textSub};
`;

const NoResultsText = styled.p`
  font-size: 16px;
  font-weight: 600;
`;

const ScriptCard = styled(motion.article)<{ isDeleting: boolean }>`
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  opacity: ${({ isDeleting }) => (isDeleting ? 0 : 1)};
  transform: ${({ isDeleting }) => (isDeleting ? 'scale(0.95)' : 'scale(1)')};

  @media (hover: hover) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.background};
    }
  }
`;

const CardBody = styled.div`
  padding: 12px;
  flex: 1;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const DateText = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
`;

const LineBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grey700};
  background-color: ${({ theme }) => theme.colors.grey100};
  border-radius: 6px;
`;

const ScriptTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Tag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSub};
  background-color: ${({ theme }) => theme.background};
  padding: 4px 8px;
  border-radius: 6px;
`;

const CardFooter = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

// 카드 액션 버튼 그룹
const CardActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'neutral' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.2s;
  cursor: pointer;

  ${({ variant, theme }) =>
    variant === 'primary'
      ? `
    background-color: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
    &:hover { background-color: ${theme.colors.primaryHover}; }
  `
      : `
    background-color: ${theme.cardBg}; color: ${theme.textMain};
    border: 1px solid ${theme.border};
    &:hover { background-color: ${theme.border}; }
  `}
`;

const DeleteButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textDisabled};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.red50};
    color: ${({ theme }) => theme.colors.error};
  }
`;

// --- Toast 컴포넌트 ---
const ToastContainer = styled.div`
  max-width: 360px;
  width: 100%;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: auto;
  box-shadow: none;
`;

const ToastHeader = styled.div`
  text-align: center;
`;

const ToastTitle = styled.p`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.textMain};
  margin-bottom: 4px;
`;

const ToastSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSub};
`;

const ToastButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ToastButton = styled.button<{ variant?: 'danger' | 'cancel' }>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;

  ${({ theme, variant }) =>
    variant === 'danger' &&
    `
    background-color: ${theme.colors.error};
    color: white;
  `}

  ${({ theme, variant }) =>
    variant === 'cancel' &&
    `
    background-color: ${theme.border};
    color: ${theme.textMain};
  `}
`;

// --- 메인 컴포넌트 ---

export function ScriptListPage() {
  const { t } = useTranslation();
  const allScripts = useAppStore((state) => state.allScripts);
  const deleteScript = useAppStore((state) => state.deleteScript);
  const saveNewScript = useAppStore((state) => state.saveNewScript);
  const language = useAppStore((state) => state.language);
  const navigate = useNavigate();
  const theme = useTheme();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const handleUploadClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsImporting(true);
    toast.loading(t('scripts.importing'), { id: 'import-script' });

    try {
      const parsed = await parseScriptFile(file);
      const newScript: ScriptData = {
        id: generateUUID(),
        title: parsed.title,
        createdAt: Date.now(),
        lines: parsed.lines,
        characters: parsed.characters,
      };

      await saveNewScript(newScript);
      toast.success(
        t('scripts.importSuccess', { title: parsed.title, count: parsed.lines.length }),
        { id: 'import-script' },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('scripts.importFailed');
      toast.error(message, { id: 'import-script' });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setIsLoggedIn(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setIsLoggedIn(!!session),
    );
    return () => subscription.unsubscribe();
  }, []);

  const handlePracticeClick = (script: ScriptData) => {
    navigate(`/talk/${script.id}`, {
      state: { lines: script.lines, scriptId: script.id, title: script.title },
    });
  };

  const handleViewClick = (scriptId: string) => {
    navigate(`/script/${scriptId}`);
  };

  const handleDeleteClick = (scriptId: string, scriptTitle: string) => {
    toast.custom(
      (toastInstance) => (
        <ToastContainer>
          <ToastHeader>
            <ToastTitle>{t('scripts.deleteConfirmTitle', { title: scriptTitle })}</ToastTitle>
            <ToastSubtitle>{t('scripts.deleteConfirmSubtitle')}</ToastSubtitle>
          </ToastHeader>
          <ToastButtonContainer>
            <ToastButton
              variant="danger"
              onClick={() => {
                // 실패 알림은 스토어에서 처리하므로 여기서는 rejection만 흡수한다.
                deleteScript(scriptId).catch(() => {});
                setDeletingId(scriptId);
                toast.dismiss(toastInstance.id);
                setTimeout(() => setDeletingId(null), 300);
              }}
            >
              {t('common.button.delete')}
            </ToastButton>
            <ToastButton variant="cancel" onClick={() => toast.dismiss(toastInstance.id)}>
              {t('common.button.cancel')}
            </ToastButton>
          </ToastButtonContainer>
        </ToastContainer>
      ),
      { duration: 6000 },
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setIsSortMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortMenuRef]);

  const filteredAndSortedScripts = useMemo(() => {
    let scripts = [...allScripts];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      scripts = scripts.filter(
        (script) =>
          script.title.toLowerCase().includes(query) ||
          script.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    switch (sortBy) {
      case 'title-asc':
        return scripts.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return scripts.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-asc':
        return scripts.sort((a, b) => a.createdAt - b.createdAt);
      case 'date-desc':
      default:
        return scripts.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [allScripts, sortBy, searchQuery]);

  const seoProps =
    language === 'en'
      ? {
          title: 'My Scripts',
          description:
            'Browse, manage, and start practicing from your collection of English scripts.',
        }
      : {
          title: '내 스크립트 목록',
          description:
            '저장된 영어 스크립트 목록을 확인하고, 관리하며, 바로 연습을 시작할 수 있습니다.',
        };

  return (
    <PageContainer role="main" aria-label={t('scripts.pageTitle')}>
      <Seo {...seoProps} />
      <Header>
        <PageTitle>{t('scripts.pageTitle')}</PageTitle>

        <Controls>
          <UploadButton onClick={handleUploadClick} disabled={isImporting} aria-label={t('scripts.uploadAria')}>
            <MdUploadFile size={18} />
            {isImporting ? t('scripts.uploading') : t('scripts.uploadButton')}
          </UploadButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf"
            onChange={handleFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          <SearchWrapper>
            <SearchInput
              placeholder={t('scripts.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('scripts.searchAria')}
            />
            {searchQuery ? (
              <ClearButton onClick={() => setSearchQuery('')}>
                <MdClose size={16} />
              </ClearButton>
            ) : (
              <SearchIcon size={20} />
            )}
          </SearchWrapper>

          <SortWrapper ref={sortMenuRef}>
            <SortButton
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              aria-label={t('scripts.sortAria')}
            >
              <MdSort size={18} />
              <span>
                {t(SORT_OPTIONS.find((opt) => opt.value === sortBy)?.labelKey || SORT_OPTIONS[0].labelKey)}
              </span>
              <AnimatedExpandIcon size={18} isOpen={isSortMenuOpen} />
            </SortButton>

            {isSortMenuOpen && (
              <SortMenu>
                {SORT_OPTIONS.map((option) => (
                  <SortOption
                    key={option.value}
                    isActive={sortBy === option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortMenuOpen(false);
                    }}
                  >
                    <span>{t(option.labelKey)}</span>
                    {sortBy === option.value && <MdCheck size={16} />}
                  </SortOption>
                ))}
              </SortMenu>
            )}
          </SortWrapper>
        </Controls>
      </Header>

      {allScripts.length === 0 ? (
        <EmptyStateContainer>
          <IconWrapper>
            {isLoggedIn ? (
              <MdLibraryBooks size={40} />
            ) : (
              <MdCloudDone size={40} style={{ color: theme.colors.success }} />
            )}
          </IconWrapper>
          <EmptyTitle>
            {isLoggedIn ? t('scripts.emptyTitleLoggedIn') : t('scripts.emptyTitleGuest')}
          </EmptyTitle>
          <EmptyDesc>
            {isLoggedIn
              ? t('scripts.emptyDescLoggedIn')
              : t('scripts.emptyDescGuest')}
          </EmptyDesc>
          <CreateButton
            onClick={() => navigate('/create')}
            isLoggedIn={isLoggedIn}
            aria-label={t('scripts.createNewAria')}
          >
            {t('scripts.createNew')}
          </CreateButton>
        </EmptyStateContainer>
      ) : filteredAndSortedScripts.length === 0 ? (
        <NoResultsContainer>
          <NoResultsText>
            {t('scripts.noResults', { query: searchQuery })}
          </NoResultsText>
        </NoResultsContainer>
      ) : (
        <Grid
          role="list"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredAndSortedScripts.map((script) => (
            <ScriptCard
              key={script.id}
              isDeleting={deletingId === script.id}
              role="listitem"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              layout
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <CardBody>
                <CardHeader>
                  <DateText>
                    {new Date(script.createdAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                  </DateText>
                  <LineBadge>
                    <MdNotes size={12} /> {script.lines.length}
                  </LineBadge>
                </CardHeader>
                <ScriptTitle>{script.title}</ScriptTitle>

                {script.tags && script.tags.length > 0 && (
                  <TagList>
                    {script.tags.map((tag, idx) => (
                      <Tag key={idx}>#{tag}</Tag>
                    ))}
                  </TagList>
                )}
              </CardBody>

              <CardFooter>
                <CardActionGroup>
                  <ActionButton
                    onClick={() => handleViewClick(script.id)}
                    variant="neutral"
                    aria-label={t('scripts.viewAria', { title: script.title })}
                  >
                    <MdVisibility size={16} /> {t('scripts.viewAction')}
                  </ActionButton>

                  <ActionButton
                    onClick={() => handlePracticeClick(script)}
                    variant="primary"
                    aria-label={t('scripts.practiceAria', { title: script.title })}
                  >
                    <MdPlayArrow size={16} /> {t('scripts.practiceAction')}
                  </ActionButton>
                </CardActionGroup>

                <DeleteButton
                  onClick={() => handleDeleteClick(script.id, script.title)}
                  aria-label={t('scripts.deleteAria', { title: script.title })}
                >
                  <MdDelete size={20} />
                </DeleteButton>
              </CardFooter>
            </ScriptCard>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
