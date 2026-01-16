import Link from 'next/link';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  capacity: number | null;
  image_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_count: number;
}

export default function EventCard({
  id,
  title,
  description,
  event_date,
  location,
  capacity,
  image_url,
  status,
  registration_count,
}: EventCardProps) {
  const statusColors = {
    upcoming: 'bg-green-100 text-green-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const isFull = capacity && registration_count >= capacity;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {image_url && (
        <img
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {isFull && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Full
            </span>
          )}
        </div>

        <Link
          href={`/events/${id}`}
          className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2 block"
        >
          {title}
        </Link>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event_date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>
              {registration_count} registered
              {capacity && ` / ${capacity}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
