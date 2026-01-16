import { useAppStore, type AppState } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import type { ScriptData } from '@/utils/types';
import {
  MdLibraryBooks,
  MdDelete,
  MdNotes,
  MdPlayArrow,
  MdSort,
  MdCheck,
  MdExpandMore,
  MdCloudDone,
} from 'react-icons/md';
import { useState, useMemo, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient'; // Supabase 객체 임포트

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest' },
  { value: 'date-asc', label: 'Oldest' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
];

export function ScriptListPage() {
  const allScripts = useAppStore((state: AppState) => state.allScripts);
  const navigate = useNavigate();
  const deleteScript = useAppStore((state: AppState) => state.deleteScript);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // 세션 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 연습 클릭
  const handlePracticeClick = (script: ScriptData) => {
    navigate(`/talk/${script.id}`, {
      state: { lines: script.lines, scriptId: script.id, title: script.title },
    });
  };

  // 삭제 클릭
  const handleDeleteClick = (scriptId: string, scriptTitle: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex p-3`}
        >
          <div className="flex-1 w-0">
            <div className="flex flex-col items-center text-center">
              <p className="text-base font-bold text-text-primary">
                Delete "{scriptTitle}"?
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                This action cannot be undone.
              </p>
              <div className="flex mt-4 gap-3 w-full">
                <button
                  onClick={() => {
                    deleteScript(scriptId);
                    setDeletingId(scriptId);
                    toast.dismiss(t.id);
                    setTimeout(() => setDeletingId(null), 300);
                  }}
                  className="w-full px-3 py-2 text-sm font-bold text-white uppercase bg-error rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full px-3 py-2 text-sm font-bold text-text-secondary uppercase bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  // 외부 클릭 시 정렬 메뉴 닫기
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

  // 정렬 로직
  const sortedScripts = useMemo(() => {
    const scripts = [...allScripts];
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
  }, [allScripts, sortBy]);

  return (
    <div className="min-h-full p-2" role="main" aria-label="Scripts library">
      <header className="mb-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-accent uppercase text-center sm:text-left">
          My Scripts
        </h1>
        <div className="flex items-center justify-center sm:justify-end gap-4">
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:bg-primary/5 rounded-lg font-bold text-sm focus:outline-none focus:text-text-primary transition-colors"
            >
              <MdSort className="w-5 h-5" />
              <span>
                {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
              </span>
              <MdExpandMore
                className={`w-5 h-5 transition-transform ${
                  isSortMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-border-default z-10 shadow-xl">
                <div className="p-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm font-bold text-text-primary rounded-lg hover:bg-primary/10"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <MdCheck className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {allScripts.length === 0 ? (
        <section
          className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center"
          role="status"
          aria-live="polite"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            {isLoggedIn ? (
              <MdLibraryBooks className="w-10 h-10 text-gray-300" />
            ) : (
              <MdCloudDone className="w-10 h-10 text-[#D95F2B]/40" />
            )}
          </div>

          <h2 className="font-display text-2xl font-black text-accent mb-3 uppercase italic">
            {isLoggedIn ? 'No Scripts Yet' : 'Welcome Back!'}
          </h2>

          <p className="font-sans text-sm sm:text-base font-medium text-secondary mb-8 max-w-sm mx-auto leading-relaxed">
            {isLoggedIn
              ? 'Create your first practice script to get started!'
              : '로그인하면 이전에 저장한 학습 기록과 스크립트를 안전하게 불러올 수 있습니다.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/create')}
              className={`px-8 py-3 font-bold rounded-xl uppercase text-sm transition-all active:scale-95 ${
                isLoggedIn
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              + Create Script
            </button>
          </div>
        </section>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="list"
        >
          {sortedScripts.map((script) => (
            <article
              key={script.id}
              className={`relative group bg-white rounded-2xl border border-border-default flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                deletingId === script.id ? 'opacity-0 scale-95' : ''
              }`}
              role="listitem"
            >
              <div className="p-3 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-text-secondary">
                    {new Date(script.createdAt).toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full">
                    <MdNotes className="w-3 h-3" />
                    {script.lines.length} lines
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-text-primary line-clamp-2 mb-2">
                  {script.title}
                </h2>
              </div>

              <div className="p-2 border-t border-border-default flex items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/script/${script.id}`)}
                    className="font-display flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-text-primary rounded-lg border border-primary/20 font-semibold uppercase text-xs hover:bg-primary/20 transition-colors"
                  >
                    <MdNotes className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => handlePracticeClick(script)}
                    className="font-display flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg border border-primary/20 font-semibold uppercase text-xs hover:bg-primary/90 transition-colors"
                  >
                    <MdPlayArrow className="w-4 h-4" /> Practice
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteClick(script.id, script.title)}
                  className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
