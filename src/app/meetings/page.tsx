'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-browser';
import type { Database } from '@/types/database';

type Meeting = Database['public']['Tables']['meetings']['Row'];

export default function MeetingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (fetchError) throw fetchError;
        setMeetings(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meetings');
        console.error('Fetch meetings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Meeting Notes</h1>
              <p className="mt-2 text-lg text-gray-600">
                Organize and track action items from your meetings
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Meeting Notes</h1>
            <p className="mt-2 text-lg text-gray-600">
              Organize and track action items from your meetings
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 whitespace-nowrap ml-4"
          >
            Process New Meeting
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Meetings List or Empty State */}
        {meetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-6">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No meetings processed yet
            </h2>
            <p className="text-gray-600 mb-8">
              Paste a Granola transcript to get started and let Atlas extract key insights,
              action items, and decisions.
            </p>
            <Link
              href="/meetings/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Your First Meeting
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(meeting.date)}
                    </p>
                    {meeting.summary && (
                      <p className="text-gray-700 mt-3 line-clamp-2">
                        {meeting.summary}
                      </p>
                    )}
                    {meeting.key_topics && meeting.key_topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {meeting.key_topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                        {meeting.key_topics.length > 3 && (
                          <span className="text-gray-600 text-xs px-2 py-1">
                            +{meeting.key_topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
