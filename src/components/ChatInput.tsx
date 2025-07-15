import React, { useState } from 'react';

type Props = {
  onSend: (message: string) => void;
  loading?: boolean;
};

export const ChatInput: React.FC<Props> = ({ onSend, loading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t bg-white dark:bg-gray-900">
      <textarea
        className="flex-1 resize-none rounded border px-3 py-2 text-sm focus:outline-none focus:ring"
        rows={2}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Describe your project or idea..."
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading || !value.trim()}
      >
        Send
      </button>
    </form>
  );
}; 