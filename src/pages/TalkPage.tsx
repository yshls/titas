import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { Toaster } from 'react-hot-toast';
import type { DialogueLine } from '@/utils/types';

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
  // 안정성을 위한 null 체크 및 기본값 설정
  const {
    lines: initialScriptLines = [],
    scriptId = 'unknown',
    title = 'Practice Session',
  } = (location.state as {
    lines: DialogueLine[];
    scriptId: string;
    title: string;
  }) || {};

  const {
    isPracticeStarted,
    isFinished,
    isMyTurn,
    isListening,
    mediaStream,
    speakerIds,
    speakerColors,
    userSpeakerId,
    currentLineIndex,
    lines,
    feedbackMap,
    userInputMap,
    userAudioMap,
    inputMode,
    typedInput,
    showHint,
    showFinishModal,
    practiceResult,
    setInputMode,
    setTypedInput,
    setShowHint,
    setShowFinishModal,
    handleStartPractice,
    handleRetryPractice,
    handleStopPractice,
    handleMicClick,
    handleSendTypedInput,
    speak,
  } = usePracticeEngine({
    lines: initialScriptLines,
    scriptId,
    title,
  });

  // 역할 선택 화면 렌더링
  if (!isPracticeStarted) {
    return (
      <>
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

  // 메인 연습 UI 렌더링
  return (
    <PageContainer>
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
        userInputMap={userInputMap}
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
          handleSendTypedInput={handleSendTypedInput}
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
