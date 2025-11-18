import { useAppStore } from '@/store/appStore';
import { useNavigate } from 'react-router-dom';
import type { ScriptData } from '@/utils/types';

export function ScriptListPage() {
  const allScripts = useAppStore((state) => state.allScripts);
  const navigate = useNavigate();

  // 연습 시작 핸들러
  const handlePracticeClick = (script: ScriptData) => {
    navigate(`/talk/${script.id}`, {
      state: { lines: script.lines },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        My Scripts
      </h1>

      {allScripts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No scripts found. Go to Create Script to make your first one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allScripts.map((script) => (
            <div
              key={script.id}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{script.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(script.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-6">
                  Total Lines:
                  <span className="font-bold">{script.lines.length}</span>
                </p>
              </div>
              <button
                onClick={() => handlePracticeClick(script)}
                className="w-full text-center bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200 shadow-md"
              >
                Practice this Script →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
