import Link from 'next/link';

export const metadata = {
  title: 'Meeting Notes | Atlas',
  description: 'View and manage your meeting notes',
};

export default function MeetingsPage() {
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

        {/* Empty State */}
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
      </div>
    </div>
  );
}
