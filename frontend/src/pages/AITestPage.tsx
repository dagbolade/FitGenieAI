// src/pages/AITestPage.tsx
import { useState } from 'react';
import { apiService } from '../services/api';

export default function AITestPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      const result = await apiService.askCoach(question);
      setAnswer(result.response);
      setIsLoading(false);
    } catch (err) {
      console.error('Error asking AI coach:', err);
      setError('Failed to get a response from the AI coach. Make sure your backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test AI Coach</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleAskQuestion}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ask a fitness question:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., What's the best exercise for chest?"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            {isLoading ? 'Asking...' : 'Ask AI Coach'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {answer && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">AI Coach Response:</h2>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}