import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';
import { useTTS } from '@/utils/useTTS';
import type { WeakSpot } from '@/utils/types';
import { MdTrendingDown, MdBarChart, MdVolumeUp } from 'react-icons/md';

const TOP_WORDS_COUNT = 10; // 표시할 상위 단어 개수

type MissedWordItemProps = {
  word: string;
  count: number;
  rank: number;
  onClick: () => void;
  isSelected: boolean;
};

/**
 * 틀린 단어 항목 컴포넌트
 */
function MissedWordItem({
  word,
  count,
  rank,
  onClick,
  isSelected,
}: MissedWordItemProps) {
  const { speak, isSpeaking } = useTTS(); // TTS 훅

  return (
    <li
      onClick={onClick}
      className={`bg-white rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isSelected
          ? 'border-primary ring-1 ring-primary'
          : 'border-border-default'
      }`}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3"
        role="button"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="shrink-0 w-10 h-10 rounded-lg border-2 border-border-default flex items-center justify-center bg-primary/10">
            <span className="font-display text-lg font-black text-text-primary">
              {rank}
            </span>
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <span className="font-display text-lg sm:text-xl font-bold text-text-primary  block">
              {word}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 전파 방지
                speak(word);
              }}
              disabled={isSpeaking}
              className="p-1 rounded-full hover:bg-primary/10 disabled:opacity-50"
              aria-label={`Listen to ${word}`}
            >
              <MdVolumeUp
                className={`w-5 h-5 transition-colors ${
                  isSpeaking ? 'text-text-primary' : 'text-text-muted'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center self-start sm:self-center gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 border-border-default bg-accent/10 sm:min-w-32">
          <MdTrendingDown
            className="w-4 h-4 sm:w-5 sm:h-5 text-accent"
            aria-hidden="true"
          />
          <span className="font-display text-sm sm:text-lg font-bold text-text-primary">
            {count} {count === 1 ? 'miss' : 'misses'}
          </span>
        </div>
      </div>
    </li>
  );
}

/**
 * 데이터 없음 플레이스홀더
 */
function NoDataPlaceholder() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-2 border-border-default mb-6">
        <MdBarChart
          className="w-10 h-10 text-text-primary"
          aria-hidden="true"
        />
      </div>
      <h3 className="font-display text-2xl font-black text-accent mb-3 uppercase">
        No Data Yet
      </h3>
      <p className="font-sans text-lg font-medium text-text-secondary mb-6">
        No weakness data yet. Keep practicing!
      </p>
      <Link
        to="/"
        className="font-display inline-flex items-center gap-2 px-3 py-3 bg-primary text-white rounded-xl border-2 border-border-default font-bold uppercase transition-transform duration-300 focus:outline-none"
      >
        Start Practicing
      </Link>
    </div>
  );
}

export function ReviewPage() {
  const practiceLogs = useAppStore((state) => state.practiceLogs);
  const [wordForPractice, setWordForPractice] = useState<string | null>(null);
  // 약점 단어 계산
  const missedWordCounts = useMemo(() => {
    const counts: Record<string, number> = {}; // 단어별 횟수 기록

    const allErrors: WeakSpot[] = practiceLogs.flatMap((log) => log.errors);

    const missedWords = allErrors
      .filter((error) => error.original)
      .map((error) =>
        error.original
          .toLowerCase()
          .trim()
          .replace(/[.,?!]+$/, '')
      )
      .filter(Boolean); // 빈 문자열이 된 항목 제거

    for (const word of missedWords) {
      // 단어 횟수 계산
      if (word) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count); // 횟수 기준 내림차순 정렬
  }, [practiceLogs]);

  return (
    <div className="min-h-full p-2 sm:p-4">
      <header className="mb-4 text-center md:text-left">
        <h1 className="font-display text-4xl font-black text-accent uppercase">
          My Weak Spots
        </h1>
      </header>

      <div className="bg-white rounded-2xl border-2 border-border-default overflow-hidden">
        <div className="p-3 border-b-2 border-border-default bg-primary ">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl border-2 border-border-default">
              <MdBarChart className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-white uppercase">
                Top {TOP_WORDS_COUNT} Missed Words
              </h2>
              <p className="font-sans text-sm font-medium text-white/90">
                Words you struggle with most
              </p>
            </div>
          </div>
        </div>

        <div className="p-3">
          {missedWordCounts.length > 0 ? ( // 조건부 렌더링
            <ol className="space-y-4">
              {missedWordCounts.slice(0, TOP_WORDS_COUNT).map((item, index) => (
                <MissedWordItem
                  key={item.word}
                  rank={index + 1}
                  word={item.word}
                  count={item.count}
                  isSelected={wordForPractice === item.word}
                  onClick={() =>
                    setWordForPractice(
                      wordForPractice === item.word ? null : item.word
                    )
                  }
                />
              ))}
            </ol>
          ) : (
            <NoDataPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}
