import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import type { DialogueLine } from '@/utils/types';
import { useAppStore } from '@/store/appStore';
import { usePracticeStore } from '@/store/practiceStore';
import { Seo } from '@/components/common/Seo';
import { usePracticeEngine } from '@/hooks/usePracticeEngine';
import { RoleSelection } from '@/components/Talk/RoleSelection';
import { PracticeHeader } from '@/components/Talk/PracticeHeader';
import { Chat } from '@/components/Talk/Chat';
import { InputBar } from '@/components/Talk/InputBar';
import { FinishModal } from '@/components/Talk/FinishModal';
import { Global, css } from '@emotion/react';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  font-family: 'lato', sans-serif;
  overflow: hidden;
  position: relative;
`;

export function TalkPage() {
  const location = useLocation();
  const { language } = useAppStore();

  const {
    lines: initialScriptLines = [],
    scriptId = 'unknown',
    title = 'Practice Session',
  } = (location.state as {
    lines: DialogueLine[];
    scriptId: string;
    title: string;
  }) || {};

  // --- 스토어 상태 선택
  const {
    status,
    lines,
    currentLineIndex,
    userSpeakerId,
    feedbackMap,
    userAudioMap,
    practiceResult,
  } = usePracticeStore((state) => ({
    status: state.status,
    lines: state.lines,
    currentLineIndex: state.currentLineIndex,
    userSpeakerId: state.userSpeakerId,
    feedbackMap: state.feedbackMap,
    userAudioMap: state.userAudioMap,
    practiceResult: state.practiceResult,
  }));

  // --- 오케스트레이터 훅 사용
  const {
    inputMode,
    setInputMode,
    typedInput,
    setTypedInput,
    isListening,
    isMyTurn,
    mediaStream,
    handleMicClick,
    handleKeyboardSubmit,
    handleStartPractice,
    handleRetryPractice,
    handleStopPractice,
    speakerIds,
    speakerColors,
    speak,
  } = usePracticeEngine({
    lines: initialScriptLines,
    scriptId,
    title,
  });

  // --- 로컬 UI 상태 관리
  const [showHint, setShowHint] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const isPracticeStarted = status === 'active' || status === 'finished';
  const isFinished = status === 'finished';

  useEffect(() => {
    if (isFinished) {
      setShowFinishModal(true);
    } else {
      setShowFinishModal(false);
    }
  }, [isFinished]);

  const seoProps =
    language === 'en'
      ? {
          title: `Practice: '${title}'`,
          description: `Start your English shadowing practice for the script '${title}'. Improve your speaking and pronunciation.`,
        }
      : {
          title: `연습: '${title}'`,
          description: `'${title}' 스크립트로 영어 쉐도잉 연습을 시작하세요. 스피킹과 발음 실력을 향상시킬 수 있습니다.`,
        };

  // --- UI 렌더링
  if (status === 'preparing' || status === 'idle') {
    return (
      <>
        <Seo {...seoProps} />
        <Global
          styles={css`
            body {
              background-color: #f7f9fc;
            }
          `}
        />
        <RoleSelection
          speakerIds={speakerIds}
          speakerColors={speakerColors}
          onSelectRole={handleStartPractice}
        />
      </>
    );
  }

  return (
    <PageContainer>
      <Seo {...seoProps} />
      <Toaster position="top-center" />

      <PracticeHeader
        onStop={handleStopPractice}
        currentIndex={currentLineIndex}
        total={lines.length}
      />

      <Chat
        lines={lines}
        userSpeakerId={userSpeakerId}
        currentLineIndex={currentLineIndex}
        isFinished={isFinished}
        feedbackMap={feedbackMap}
        userAudioMap={userAudioMap}
        showHint={showHint}
        speakerColors={speakerColors}
        onSpeak={speak}
      />

      {!isFinished && (
        <InputBar
          inputMode={inputMode}
          setInputMode={setInputMode}
          isListening={isListening}
          handleMicClick={handleMicClick}
          isMyTurn={isMyTurn}
          hasFeedback={!!feedbackMap[currentLineIndex]}
          mediaStream={mediaStream}
          showHint={showHint}
          setShowHint={setShowHint}
          typedInput={typedInput}
          setTypedInput={setTypedInput}
          handleSendTypedInput={handleKeyboardSubmit}
        />
      )}

      <FinishModal
        show={showFinishModal}
        practiceResult={practiceResult}
        onClose={() => setShowFinishModal(false)}
        onRetry={handleRetryPractice}
      />
    </PageContainer>
  );
}
