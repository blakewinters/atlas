'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/components/AuthProvider';

interface ProcessedMeeting {
  title: string;
  summary: string;
  action_items: Array<{
    task: string;
    assignee?: string;
    due?: string | null;
    completed?: boolean;
  }>;
  decisions: Array<{
    decision: string;
    context?: string;
  }>;
  key_topics: string[];
  raw_transcript?: string;
  date?: string;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ProcessedMeeting | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/process-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          date: date || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process meeting');
      }

      const data = await response.json();
      setResults(data);
      setEditableTitle(data.title);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeeting = async () => {
    if (!results || !user) return;
    setSaving(true);
    setError('');

    try {
      // Save meeting to Supabase
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          title: editableTitle,
          date: results.date || new Date().toISOString(),
          raw_transcript: results.raw_transcript || transcript,
          summary: results.summary,
          action_items: results.action_items,
          decisions: results.decisions,
          key_topics: results.key_topics,
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Create tasks from action items
      if (results.action_items && results.action_items.length > 0 && meetingData) {
        const tasksToCreate = results.action_items.map((item) => ({
          user_id: user.id,
          meeting_id: meetingData.id,
          title: item.task,
          description: item.assignee ? `Assignee: ${item.assignee}` : null,
          status: 'todo' as const,
          priority: 'medium' as const,
          due_date: item.due || null,
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToCreate);

        if (tasksError) throw tasksError;
      }

      // Redirect to meetings list
      router.push('/meetings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meeting');
      console.error('Save meeting error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActionItem = (index: number) => {
    if (!results) return;
    const updatedItems = [...results.action_items];
    updatedItems[index].completed = !updatedItems[index].completed;
    setResults({ ...results, action_items: updatedItems });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Process Meeting Notes</h1>
          <p className="mt-2 text-lg text-gray-600">
            Paste your Granola meeting transcript to extract key insights
          </p>
        </div>

        {!showResults ? (
          /* Form Section */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transcript Input */}
            <div>
              <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Transcript
              </label>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your Granola meeting transcript here..."
                className="w-full min-h-[300px] border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
                required
              />
            </div>

            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Date (Optional)
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !transcript.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Processing...' : 'Process with Atlas'}
              </button>
            </div>
          </form>
        ) : results ? (
          /* Results Section */
          <div className="space-y-6 animate-fadeIn">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                id="title"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="w-full text-2xl font-bold border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {results.summary}
              </p>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
              <div className="space-y-3">
                {results.action_items.length > 0 ? (
                  results.action_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleToggleActionItem(index)}
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.completed && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p
                          className={`font-medium ${
                            item.completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.task}
                        </p>
                        {item.assignee && (
                          <p className="text-sm text-gray-600 mt-1">
                            Assignee: <span className="font-medium">{item.assignee}</span>
                          </p>
                        )}
                        {item.due && (
                          <p className="text-sm text-gray-600">
                            Due: <span className="font-medium">{item.due}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No action items identified.</p>
                )}
              </div>
            </div>

            {/* Decisions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Decisions</h2>
              <div className="space-y-3">
                {results.decisions.length > 0 ? (
                  results.decisions.map((decision, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium text-gray-900">{decision.decision}</p>
                      {decision.context && (
                        <p className="text-sm text-gray-600 mt-1">{decision.context}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No decisions identified.</p>
                )}
              </div>
            </div>

            {/* Key Topics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Topics</h2>
              {results.key_topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {results.key_topics.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No key topics identified.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveMeeting}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {saving ? 'Saving...' : 'Save Meeting'}
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setResults(null);
                  setTranscript('');
                  setEditableTitle('');
                }}
                disabled={saving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Process Another
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
