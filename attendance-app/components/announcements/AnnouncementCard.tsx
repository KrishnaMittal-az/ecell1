import Link from 'next/link';
import { Pin, MessageSquare } from 'lucide-react';

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  visibility: 'all' | '1st_year' | '2nd_year' | '3rd_year';
  is_pinned: boolean;
  created_at: string;
  created_by_name: string;
  read_at: string | null;
}

export default function AnnouncementCard({
  id,
  title,
  content,
  visibility,
  is_pinned,
  created_at,
  created_by_name,
  read_at,
}: AnnouncementCardProps) {
  const visibilityLabels = {
    all: 'All',
    '1st_year': '1st Year',
    '2nd_year': '2nd Year',
    '3rd_year': '3rd Year',
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${!read_at ? 'border-l-4 border-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {is_pinned && (
            <Pin className="w-4 h-4 text-blue-600" fill="currentColor" />
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            {visibilityLabels[visibility]}
          </span>
        </div>

        {!read_at && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            New
          </span>
        )}
      </div>

      <Link
        href={`/announcements/${id}`}
        className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2 block"
      >
        {title}
      </Link>

      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>By {created_by_name}</span>
        <span>{new Date(created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
