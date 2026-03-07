import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
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
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#3b82f6'};
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
  resize: none;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

interface EditableTextProps {
  initialText: string;
  onSave: (newText: string) => void;
  onEditStart?: () => void;
}

export function EditableText({ initialText, onSave, onEditStart }: EditableTextProps) {
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
    if (trimmedText && trimmedText !== initialText) {
      onSave(trimmedText);
    } else {
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
      />
    );
  }

  return (
    <Container>
      <TextContent onDoubleClick={handleEditStart}>
        {initialText}
      </TextContent>
      <EditIconWrapper onClick={handleEditStart} className="edit-icon" title="Edit">
        <MdEdit size={16} />
      </EditIconWrapper>
    </Container>
  );
}
