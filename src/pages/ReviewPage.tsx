import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';
import type { WeakSpot } from '@/utils/types';
import { MdTrendingDown, MdBarChart } from 'react-icons/md';

export function ReviewPage() {
  const practiceLogs = useAppStore((state) => state.practiceLogs);

  // 약점 단어 계산
  const missedWordCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const allErrors: WeakSpot[] = practiceLogs.flatMap((log) => log.errors);

    const missedWords = allErrors
      .filter((error) => error.original)
      .map((error) => error.original.toLowerCase().trim());

    for (const word of missedWords) {
      if (word) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [practiceLogs]);

  return (
    <div className="min-h-full">
      {/* 헤더 */}
      <header className="mb-4">
        <h1 className="font-display text-4xl font-black text-primary uppercase">
          My Weak Spots
        </h1>
      </header>

      {/* 메인 */}
      <div className="bg-white rounded-2xl border-3 border-textPrimary overflow-hidden">
        {/* 카드 헤더 */}
        <div className="p-4 border-b-3 border-textPrimary bg-primary">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl border-3 border-textPrimary">
              <MdBarChart
                className="w-7 h-7 text-textPrimary"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-white uppercase">
                Top 10 Missed Words
              </h2>
              <p className="font-sans text-sm font-medium text-white/90">
                Words you struggle with most
              </p>
            </div>
          </div>
        </div>

        {/* 카드 콘텐츠 */}
        <div className="p-4">
          {missedWordCounts.length > 0 ? (
            <ol className="space-y-4">
              {missedWordCounts.slice(0, 10).map((item, index) => (
                <li
                  key={item.word}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border-3 border-textPrimary hover:scale-[1.02] transition-all"
                >
                  {/* 순위 */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg border-3 border-textPrimary flex items-center justify-center"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    <span className="font-display text-lg font-black text-textPrimary">
                      {index + 1}
                    </span>
                  </div>

                  {/* 단어 */}
                  <div className="flex-1 min-w-0">
                    <span className="font-display text-xl font-black text-textPrimary uppercase block">
                      {item.word}
                    </span>
                  </div>

                  {/* 횟수 */}
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-3 border-textPrimary"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    <MdTrendingDown
                      className="w-5 h-5 text-primary"
                      aria-hidden="true"
                    />
                    <span className="font-display text-base font-bold text-primary">
                      {item.count} {item.count === 1 ? 'miss' : 'misses'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            /* 데이터 없음 */
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-3 border-textPrimary mb-6">
                <MdBarChart
                  className="w-10 h-10 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-2xl font-black text-primary mb-3 uppercase">
                No Data Yet
              </h3>
              <p className="font-sans text-lg font-medium text-secondary mb-6">
                No weakness data yet. Keep practicing!
              </p>
              <Link
                to="/"
                className="font-display inline-flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl border-3 border-textPrimary font-bold uppercase hover:scale-105 transition-all focus:outline-none focus:ring-3 focus:ring-black"
              >
                Start Practicing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
