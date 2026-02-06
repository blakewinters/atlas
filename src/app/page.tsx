export default function Dashboard() {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

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
          { label: 'Open Tasks', value: '—' },
          { label: "This Week's Meetings", value: '—' },
          { label: 'Decisions Made', value: '—' },
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Meetings
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600">
            No meetings yet. Process your first Granola transcript to get
            started.
          </p>
        </div>
      </div>

      {/* Active Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Tasks
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600">
            No active tasks. Tasks will appear here as you process meetings.
          </p>
        </div>
      </div>
    </div>
  );
}
