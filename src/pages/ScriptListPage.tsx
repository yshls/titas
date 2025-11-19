import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import type { ScriptData } from '@/utils/types';
import { MdPlayArrow, MdLibraryBooks, MdAdd } from 'react-icons/md';
import { useState } from 'react';

export function ScriptListPage() {
  const allScripts = useAppStore((state) => state.allScripts);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 연습 시작 핸들러
  const handlePracticeClick = (script: ScriptData) => {
    navigate(`/talk/${script.id}`, {
      state: { lines: script.lines },
    });
  };

  return (
    <div className="min-h-full" role="main" aria-label="Scripts library">
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="font-display text-3xl font-black text-primary dark:text-[#E8E6E3] mb-1 uppercase">
          My Scripts
        </h1>
        <p className="font-sans text-base font-medium text-secondary dark:text-[#B8B6B3]">
          {allScripts.length} {allScripts.length === 1 ? 'script' : 'scripts'}
        </p>
      </header>

      {/* Empty State */}
      {allScripts.length === 0 ? (
        <section
          className="text-center py-16 px-6 bg-white dark:bg-[#2D2621] rounded-2xl border-4 border-dashed border-black dark:border-[#E8E6E3]"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary border-3 border-black mb-4">
            <MdLibraryBooks className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h2 className="font-display text-2xl font-black text-primary dark:text-[#E8E6E3] mb-2 uppercase">
            No Scripts Yet
          </h2>
          <p className="font-sans text-base font-medium text-secondary dark:text-[#B8B6B3] mb-6 max-w-md mx-auto">
            Create your first practice script to get started!
          </p>
          <button
            onClick={() => navigate('/create')}
            className="font-display inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl border-3 border-black font-bold uppercase text-sm hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-black"
            aria-label="Create your first script"
          >
            <MdAdd className="w-5 h-5" aria-hidden="true" />
            Create Script
          </button>
        </section>
      ) : (
        /* 스크립트 그리드 */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="list"
          aria-label="List of practice scripts"
        >
          {allScripts.map((script) => (
            <article
              key={script.id}
              className={`group bg-white dark:bg-[#2D2621] rounded-xl border-3 border-black dark:border-[#E8E6E3] overflow-hidden transition-all duration-300 ${
                deletingId === script.id
                  ? 'opacity-50 scale-95'
                  : 'hover:scale-[1.02]'
              }`}
              role="listitem"
              aria-label={`Script: ${script.title}`}
            >
              {/* 제목 */}
              <div className="p-4 border-b-3 border-black dark:border-[#E8E6E3]">
                <h2 className="font-display text-lg font-black text-primary dark:text-[#E8E6E3] uppercase text-center line-clamp-2">
                  {script.title}
                </h2>
              </div>

              {/* Practice 버튼 */}
              <div className="p-4">
                <button
                  onClick={() => handlePracticeClick(script)}
                  className="font-display w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg border-3 border-black font-bold uppercase text-sm hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-black"
                  aria-label={`Start practicing ${script.title}`}
                >
                  <MdPlayArrow className="w-5 h-5" aria-hidden="true" />
                  Practice
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
