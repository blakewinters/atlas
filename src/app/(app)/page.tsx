'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-browser';
import type { Database } from '@/types/database';

type Meeting = Database['public']['Tables']['meetings']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [thisWeekMeetingsCount, setThisWeekMeetingsCount] = useState(0);
  const [decisionsCount, setDecisionsCount] = useState(0);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all tasks to count open ones
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .neq('status', 'done')
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        const tasks = tasksData || [];
        setOpenTasksCount(tasks.length);
        setActiveTasks(tasks.slice(0, 5)); // Show top 5 active tasks

        // Fetch meetings from this week
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const { data: meetingsData, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekAgo.toISOString())
          .order('date', { ascending: false });

        if (meetingsError) throw meetingsError;
        const meetings = meetingsData || [];
        setThisWeekMeetingsCount(meetings.length);
        setRecentMeetings(meetings.slice(0, 3)); // Show top 3 recent meetings

        // Count total decisions
        let totalDecisions = 0;
        meetings.forEach((meeting) => {
          if (meeting.decisions && Array.isArray(meeting.decisions)) {
            totalDecisions += meeting.decisions.length;
          }
        });
        setDecisionsCount(totalDecisions);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {getTimeGreeting()}, Blake
        </h1>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {getTimeGreeting()}, Blake
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Open Tasks', value: openTasksCount },
          { label: "This Week's Meetings", value: thisWeekMeetingsCount },
          { label: 'Decisions Made', value: decisionsCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm font-medium text-gray-600 mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Meetings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Meetings
          </h2>
          <Link
            href="/meetings"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {recentMeetings.length > 0 ? (
          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(meeting.date)}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              No meetings yet. Process your first Granola transcript to get
              started.
            </p>
          </div>
        )}
      </div>

      {/* Active Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Tasks
          </h2>
          <Link
            href="/meetings"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {activeTasks.length > 0 ? (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
              >
                <div
                  className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 ${
                    task.priority === 'high'
                      ? 'bg-red-500'
                      : task.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {task.due_date}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded ${
                    task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              No active tasks. Tasks will appear here as you process meetings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
