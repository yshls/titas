import { useAppStore, type AppState } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import type { ScriptData } from '@/utils/types';
import {
  MdLibraryBooks,
  MdAdd,
  MdDelete,
  MdNotes,
  MdPlayArrow,
  MdSort,
  MdCheck,
  MdExpandMore,
} from 'react-icons/md';
import { useState, useMemo, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

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
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // 연습
  const handlePracticeClick = (script: ScriptData) => {
    navigate(`/talk/${script.id}`, {
      state: { lines: script.lines, scriptId: script.id },
    });
  };

  // 삭제
  const handleDeleteClick = (scriptId: string, scriptTitle: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex  p-3`}
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
                    setDeletingId(scriptId);
                    toast.dismiss(t.id);
                    setTimeout(() => {
                      deleteScript(scriptId);
                      setDeletingId(null);
                    }, 300);
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

  // 메뉴 닫기
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortMenuRef]);

  // 정렬
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
    <div className="min-h-full" role="main" aria-label="Scripts library">
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

            {/* 정렬 메뉴 */}
            {isSortMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-default z-10">
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
          className="text-center py-12 sm:py-16 px-3 sm:px-6 bg-white rounded-2xl border border-border-dashed"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary border border-border-default mb-4">
            <MdLibraryBooks
              className="w-7 h-7 sm:w-8 sm:h-8 text-white"
              aria-hidden="true"
            />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-accent mb-2 uppercase">
            No Scripts Yet
          </h2>
          <p className="font-sans text-sm sm:text-base font-medium text-secondary mb-3 max-w-md mx-auto">
            Create your first practice script to get started!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="font-display inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-xl border border-border-default font-bold uppercase text-sm transition-transform duration-300 focus:outline-none"
            aria-label="Create your first script"
          >
            <MdAdd className="w-5 h-5" aria-hidden="true" />
            Create Script
          </button>
        </section>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="list"
          aria-label="List of practice scripts"
        >
          {sortedScripts.map((script) => (
            <article
              key={script.id}
              className={`group bg-white rounded-2xl border border-border-default flex flex-col transition-all duration-300 ${
                deletingId === script.id ? 'opacity-0 scale-95' : ''
              }`}
              role="listitem"
              aria-label={`Script: ${script.title}`}
            >
              <div className="p-3 flex-1">
                <h2 className="font-display text-lg font-bold text-text-primary line-clamp-2 mb-2">
                  {script.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                  <MdNotes className="w-4 h-4" />
                  <span>{script.lines.length} lines</span>
                  <span className="text-text-muted">•</span>
                  <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-2 sm:p-3 bg-primary/5 border-t border-border-default flex items-center justify-between">
                <button
                  onClick={() => handlePracticeClick(script)}
                  className="font-display flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-text-primary rounded-lg border border-primary/20 font-semibold uppercase text-sm hover:bg-primary/20 transition-all duration-300 focus:outline-none"
                  aria-label={`Start practicing ${script.title}`}
                >
                  <MdPlayArrow className="w-5 h-5" aria-hidden="true" />
                  Practice
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteClick(script.id, script.title)}
                    className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"
                    aria-label={`Delete ${script.title}`}
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
