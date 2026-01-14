'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Pin, User } from 'lucide-react';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`/api/announcements/${params.id}`);
      const data = await response.json();
      setAnnouncement(data.announcement);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Announcement not found</p>
      </div>
    );
  }

  const visibilityLabels = {
    all: 'All Members',
    '1st_year': '1st Year Students',
    '2nd_year': '2nd Year Students',
    '3rd_year': '3rd Year Students',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {announcement.is_pinned && (
                <Pin className="w-5 h-5 text-blue-600" fill="currentColor" />
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {visibilityLabels[announcement.visibility as keyof typeof visibilityLabels]}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(announcement.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {announcement.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {announcement.users?.name}
              </p>
              <p className="text-sm text-gray-500">
                {announcement.users?.email}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
              {announcement.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
