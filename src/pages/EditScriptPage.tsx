import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type AppState } from '@/store/appStore';
import type { ScriptData, DialogueLine } from '@/utils/types';
import toast from 'react-hot-toast';
import { MdSave, MdArrowBack, MdDelete, MdAdd, MdPerson } from 'react-icons/md';

export function EditScriptPage() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();

  const getScriptById = useAppStore((state: AppState) => state.getScriptById);
  const updateScript = useAppStore((state: AppState) => state.updateScript);

  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<Partial<DialogueLine>[]>([]);

  useEffect(() => {
    if (scriptId) {
      const scriptToEdit = getScriptById(scriptId);
      if (scriptToEdit) {
        setTitle(scriptToEdit.title);
        setLines(scriptToEdit.lines);
      } else {
        toast.error('Script not found!');
        navigate('/scripts');
      }
    }
  }, [scriptId, getScriptById, navigate]);

  const handleLineChange = (
    index: number,
    field: 'speakerId' | 'originalLine',
    value: string
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([
      ...lines,
      { id: `new-${Date.now()}`, speakerId: '', originalLine: '' },
    ]);
  };

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title cannot be empty.');
      return;
    }

    if (!scriptId) return;
    const scriptToEdit = getScriptById(scriptId);
    if (!scriptToEdit) return;

    const filteredLines = lines.filter((line) => line.originalLine?.trim());
    if (filteredLines.length === 0) {
      toast.error('Script must have at least one line.');
      return;
    }

    const updatedLines: DialogueLine[] = filteredLines.map((line, index) => ({
      id: line.id?.startsWith('new-') ? `${Date.now()}-${index}` : line.id!,
      speakerId: line.speakerId || '',
      originalLine: line.originalLine!,
      speakerColor: '', // 임시 값, 저장 로직에서 채워짐
      isUserTurn: false, // 임시 값
    }));

    const updatedScript: ScriptData = {
      ...scriptToEdit,
      title: title.trim(),
      lines: updatedLines,
      updatedAt: Date.now(),
    };

    updateScript(updatedScript);
    toast.success('Script updated successfully!');
    navigate('/scripts');
  };

  return (
    <div className="max-w-4xl mx-auto p-2" role="main">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-accent uppercase">
          Edit Script
        </h1>
        <button
          onClick={() => navigate('/scripts')}
          className="flex self-start sm:self-center items-center gap-2 px-4 py-2 text-text-secondary hover:bg-primary/5 rounded-lg font-bold text-sm"
        >
          <MdArrowBack className="w-5 h-5" />
          Back to List
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-border-default">
          <label
            htmlFor="title"
            className="block text-sm font-bold text-text-primary mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-bold text-lg"
            placeholder="Enter a title for your script"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-border-default space-y-4">
          <h2 className="text-lg font-bold text-text-primary">
            Dialogue Lines
          </h2>
          {lines.map((line, index) => (
            <div
              key={line.id || index}
              className="flex flex-col sm:flex-row items-start gap-2 p-3 bg-gray-50 rounded-lg border border-border-default"
            >
              <div className="w-full sm:w-40 flex items-center gap-2">
                <MdPerson className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={line.speakerId || ''}
                  onChange={(e) =>
                    handleLineChange(index, 'speakerId', e.target.value)
                  }
                  placeholder={`Speaker ${index + 1}`}
                  className="w-full bg-transparent focus:outline-none font-semibold"
                />
              </div>
              <div className="flex-1 w-full">
                <textarea
                  value={line.originalLine || ''}
                  onChange={(e) =>
                    handleLineChange(index, 'originalLine', e.target.value)
                  }
                  placeholder="Enter dialogue text..."
                  className="w-full bg-transparent focus:outline-none resize-none"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="p-2 rounded-md text-gray-400 hover:bg-error/10 hover:text-error transition-colors self-center sm:self-start"
                aria-label={`Delete line ${index + 1}`}
              >
                <MdDelete className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLine}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-border-dashed rounded-lg text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Add Line
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-primary text-white rounded-xl border border-border-default font-bold uppercase text-sm"
          >
            <MdSave className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
