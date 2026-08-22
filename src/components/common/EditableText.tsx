import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { MdEdit } from 'react-icons/md';

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  &:hover .edit-icon {
    opacity: 1;
  }
`;

const TextContent = styled.div`
  cursor: text;
  flex: 1;
  white-space: pre-wrap;
`;

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.colors?.grey400 || '#adb5bd'};
`;

const EditIconWrapper = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSub || '#888'};
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#3b82f6'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  resize: none;
  outline: none;
  overflow: hidden;
  box-shadow: none;
`;

interface EditableTextProps {
  initialText: string;
  onSave: (newText: string) => void;
  onEditStart?: () => void;
  /** 비어 있을 때 대신 보여줄 안내 문구 (한국어 뜻처럼 비워둘 수 있는 값에 사용) */
  placeholder?: string;
}

export function EditableText({
  initialText,
  onSave,
  onEditStart,
  placeholder,
}: EditableTextProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [text, isEditing]);

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setText(initialText);
    onEditStart?.();
    setTimeout(() => {
      textAreaRef.current?.focus();
      const length = textAreaRef.current?.value.length || 0;
      textAreaRef.current?.setSelectionRange(length, length);
    }, 0);
  };

  const handleSave = () => {
    const trimmedText = text.trim();
    // placeholder가 있는 칸은 비워두는 것도 유효한 값이라 빈 문자열도 저장한다.
    const canBeEmpty = placeholder !== undefined;

    if (trimmedText !== initialText && (trimmedText || canBeEmpty)) {
      onSave(trimmedText);
    } else if (!trimmedText && !canBeEmpty) {
      setText(initialText); // 원복
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setText(initialText);
      setIsEditing(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <TextArea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
      />
    );
  }

  // 안내 문구만 있는 빈 칸은 한 번만 눌러도 바로 채울 수 있게 한다.
  // (더블클릭은 마우스에서만 편해서 모바일에서는 채울 방법이 없다.)
  const isEmptyPlaceholder = !initialText && placeholder !== undefined;

  return (
    <Container>
      <TextContent
        onDoubleClick={handleEditStart}
        onClick={isEmptyPlaceholder ? handleEditStart : undefined}
      >
        {initialText || <PlaceholderText>{placeholder}</PlaceholderText>}
      </TextContent>
      <EditIconWrapper onClick={handleEditStart} className="edit-icon" title={t('common.button.edit')}>
        <MdEdit size={16} />
      </EditIconWrapper>
    </Container>
  );
}
