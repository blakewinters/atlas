'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-browser';
import type { Database } from '@/types/database';

type Meeting = Database['public']['Tables']['meetings']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export default function MeetingDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    const fetchMeetingAndTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch meeting
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', meetingId)
          .eq('user_id', user.id)
          .single();

        if (meetingError) throw meetingError;
        if (!meetingData) throw new Error('Meeting not found');

        setMeeting(meetingData);

        // Fetch tasks for this meeting
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meeting');
        console.error('Fetch meeting error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingAndTasks();
  }, [user, authLoading, meetingId]);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus as any })
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, status: newStatus as any }
            : task
        )
      );
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700">
              {error || 'Meeting not found'}
            </p>
          </div>
          <Link
            href="/meetings"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  const actionItemsFromMeeting = meeting.action_items || [];
  const decisions = meeting.decisions || [];
  const keyTopics = meeting.key_topics || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/meetings"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Meetings
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">
            {meeting.title}
          </h1>
          <p className="text-gray-600 mt-2">
            {formatDate(meeting.date)}
          </p>
        </div>

        {/* Summary */}
        {meeting.summary && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {meeting.summary}
            </p>
          </div>
        )}

        {/* Key Topics */}
        {keyTopics.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Key Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {keyTopics.map((topic, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Decisions */}
        {decisions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Decisions
            </h2>
            <div className="space-y-4">
              {decisions.map((decision, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">
                    {typeof decision === 'object' && 'decision' in decision
                      ? decision.decision
                      : decision}
                  </p>
                  {typeof decision === 'object' &&
                    'context' in decision &&
                    decision.context && (
                      <p className="text-sm text-gray-600 mt-1">
                        {decision.context}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items and Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Action Items
          </h2>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleTaskStatusChange(task.id, e.target.value)
                    }
                    className="flex-shrink-0 px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="flex-grow min-w-0">
                    <p
                      className={`font-medium ${
                        task.status === 'done'
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-gray-600">
                        Due: {task.due_date}
                      </p>
                    )}
                  </div>
                  {task.priority && (
                    <span
                      className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : actionItemsFromMeeting.length > 0 ? (
            <div className="space-y-3">
              {actionItemsFromMeeting.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 mt-0.5" />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-gray-900">{item.task}</p>
                    {item.assignee && (
                      <p className="text-sm text-gray-600 mt-1">
                        Assignee: <span className="font-medium">
                          {item.assignee}
                        </span>
                      </p>
                    )}
                    {item.due && (
                      <p className="text-sm text-gray-600">
                        Due: <span className="font-medium">{item.due}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No action items identified.</p>
          )}
        </div>

        {/* Raw Transcript */}
        {meeting.raw_transcript && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Full Transcript
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {meeting.raw_transcript}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
