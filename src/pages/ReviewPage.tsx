import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';
import type { WeakSpot } from '@/utils/types';

export function ReviewPage() {
  const practiceLogs = useAppStore((state) => state.practiceLogs);

  // 빼먹은 단어 빈도수 계산
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
    <div className="p-8 bg-gray-900 text-gray-200 min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-white">My Weak Spots</h1>

      <Link to="/" className="text-blue-400 hover:text-blue-300 mb-6 block">
        &larr; Back to Dashboard
      </Link>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-orange-400">
          Top 10 Missed Words
        </h2>

        {missedWordCounts.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2">
            {missedWordCounts.slice(0, 10).map((item) => (
              <li key={item.word} className="text-lg">
                <span className="font-bold text-white">{item.word}</span>
                <span className="text-gray-400">
                  {' '}
                  (missed {item.count} times)
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-400">
            No weakness data yet. Keep practicing!
          </p>
        )}
      </div>
    </div>
  );
}
