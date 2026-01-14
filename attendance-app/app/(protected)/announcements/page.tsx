'use client';

import { useEffect, useState } from 'react';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import { Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [sortType, setSortType] = useState('recent');

  useEffect(() => {
    fetchAnnouncements();
  }, [visibilityFilter, sortType]);

  const fetchAnnouncements = async () => {
    try {
      const params = new URLSearchParams();
      if (visibilityFilter) params.append('visibility', visibilityFilter);
      params.append('sort', sortType);

      const response = await fetch(`/api/announcements?${params.toString()}`);
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Announcements
            </h1>
            <p className="text-gray-600">
              Stay updated with the latest E-Cell news
            </p>
          </div>
          <Link
            href="/announcements/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Announcement
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Visibility
              </label>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="all">Everyone</option>
                <option value="1st_year">1st Year</option>
                <option value="2nd_year">2nd Year</option>
                <option value="3rd_year">3rd Year</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="pinned">Pinned First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No announcements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {announcements.map((announcement: any) => (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                title={announcement.title}
                content={announcement.content}
                visibility={announcement.visibility}
                is_pinned={announcement.is_pinned}
                created_at={announcement.created_at}
                created_by_name={announcement.users?.name}
                read_at={announcement.read_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
