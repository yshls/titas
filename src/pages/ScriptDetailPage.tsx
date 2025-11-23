import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type AppState } from '@/store/appStore';
import {
  MdArrowBack,
  MdVolumeUp,
  MdPlayArrow,
  MdRecordVoiceOver,
} from 'react-icons/md';
import type { ScriptData } from '@/utils/types';
import { useTTS } from '@/utils/useTTS';
import { useRef, useMemo, useState } from 'react';

export function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { speak, isSpeaking, voices } = useTTS();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const script = useAppStore((state: AppState) =>
    state.allScripts.find((s) => s.id === id)
  );

  const speakerIds = useMemo(
    () =>
      script ? [...new Set(script.lines.map((line) => line.speakerId))] : [],
    [script]
  );

  const speakerColors = useMemo(() => {
    const colors: Record<string, string> = {};
    speakerIds.forEach((id, index) => {
      colors[id] = `var(--color-speaker${index + 1})`;
    });
    return colors;
  }, [speakerIds]);

  const englishVoices = useMemo(
    () => voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith('en-')),
    [voices]
  );

  const handlePracticeClick = (scriptData: ScriptData) => {
    navigate(`/talk/${scriptData.id}`, {
      state: { lines: scriptData.lines, scriptId: scriptData.id },
    });
  };

  if (!script) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Script Not Found
        </h2>
        <p className="text-text-secondary mb-6">
          The script you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to My Scripts
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-main overflow-hidden">
      {/* 헤더 */}
      <div className="bg-border-subtle/30 border-b px-3 border-border-default py-2 flex-shrink-0 flex items-center justify-between gap-x-4 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 text-text-secondary hover:text-primary transition-colors"
            aria-label="Go back"
          >
            <MdArrowBack className="w-6 h-6" />
          </button>
          <h1 className="font-display text-lg md:text-xl font-black text-accent truncate leading-tight">
            {script.title}
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs text-text-secondary font-sans flex-shrink-0">
          <MdRecordVoiceOver className="w-4 h-4" />
          <select
            value={selectedVoiceURI || ''}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className="bg-transparent font-bold focus:outline-none"
            aria-label="Select TTS voice"
          >
            <option value="">Default Voice</option>
            {englishVoices.map((voice: SpeechSynthesisVoice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end flex-1 min-w-0">
          <p className="text-xs text-text-secondary font-sans truncate">
            {script.lines.length} lines • {speakerIds.length} speakers
          </p>
        </div>
      </div>

      {/* 대화 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto py-3 px-2 bg-bg-main"
      >
        <div className=" mx-auto space-y-3">
          {script.lines.map((line, index) => {
            const isPrimarySpeakerSide =
              speakerIds.indexOf(line.speakerId) % 2 === 0;

            return (
              <div
                key={index}
                className={`flex ${
                  isPrimarySpeakerSide ? 'justify-end' : 'justify-start'
                }`}
              >
                <button
                  onClick={() =>
                    !isSpeaking && speak(line.originalLine, selectedVoiceURI)
                  }
                  disabled={isSpeaking}
                  className={`group relative max-w-[90%] md:max-w-[75%] p-2 rounded-2xl border text-left transition-colors border-border-default hover:border-primary disabled:cursor-not-allowed  ${
                    isPrimarySpeakerSide ? 'rounded-tr-none' : 'rounded-tl-none'
                  }`}
                  style={{ backgroundColor: speakerColors[line.speakerId] }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display font-bold text-xs uppercase text-text-primary/80 truncate">
                      {line.speakerId}
                    </p>
                    <MdVolumeUp
                      className={`w-4 h-4 text-text-primary/40 transition-opacity duration-300 ${
                        isSpeaking
                          ? 'opacity-50'
                          : 'opacity-40 group-hover:opacity-100'
                      }`}
                    />
                  </div>

                  <p className="text-sm md:text-base text-text-primary leading-relaxed font-sans">
                    {line.originalLine}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 */}
      <div className="border-t border-border-default p-2 flex-shrink-0 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => handlePracticeClick(script)}
            className="w-full flex items-center justify-center gap-2 p-3 sm:py-2 bg-primary text-white rounded-xl font-display font-black uppercase text-base sm:text-lg shadow-md transition-all hover:bg-primary/90  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            <MdPlayArrow className="w-7 h-7" />
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
