interface TaskCardProps {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  source?: string;
}

export default function TaskCard({
  title,
  description,
  status,
  priority,
  due_date,
  source,
}: TaskCardProps) {
  // Status indicator colors
  const statusConfig = {
    todo: { color: 'bg-gray-400', label: 'To Do' },
    in_progress: { color: 'bg-blue-500', label: 'In Progress' },
    done: { color: 'bg-green-500', label: 'Done' },
  };

  // Priority badge colors
  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
    high: { color: 'bg-red-100 text-red-700', label: 'High' },
  };

  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];

  // Format date
  const formattedDate = due_date
    ? new Date(due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header with status and priority */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Status Indicator */}
          <div
            className={`flex-shrink-0 w-3 h-3 rounded-full ${statusInfo.color}`}
            title={statusInfo.label}
            aria-label={`Status: ${statusInfo.label}`}
          />
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
        </div>
        {/* Priority Badge */}
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${priorityInfo.color}`}
        >
          {priorityInfo.label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      )}

      {/* Metadata */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        {/* Due Date */}
        {formattedDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Due {formattedDate}</span>
          </div>
        )}

        {/* Source */}
        {source && (
          <p className="text-xs text-gray-500">{source}</p>
        )}
      </div>
    </div>
  );
}
