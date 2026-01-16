'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Plus, Check } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();
      setEvent(data.event);

      // Check if current user is registered
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isRegistered = data.event?.event_registrations?.some(
        (reg: any) => reg.user_id === user.id
      );
      setRegistered(isRegistered);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await fetch(`/api/events/${params.id}/register`, {
        method: 'POST',
      });

      if (response.ok) {
        setRegistered(true);
        await fetchEvent(); // Refresh to get updated data
      }
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/register`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRegistered(false);
        await fetchEvent();
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Event not found</p>
      </div>
    );
  }

  const isFull = event.capacity && event.event_registrations?.length >= event.capacity;
  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Image */}
        {event.image_url && (
          <div className="mb-8">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Created by {event.users?.name}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {event.description && (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    {event.event_registrations?.length || 0} registered
                    {event.capacity && ` / ${event.capacity} spots`}
                  </span>
                </div>
              </div>
            </div>

            {/* Registrations List */}
            {event.event_registrations && event.event_registrations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Registered Attendees
                </h2>
                <div className="space-y-3">
                  {event.event_registrations.map((reg: any) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {reg.users?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reg.users?.email}
                        </p>
                      </div>
                      {reg.attended && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isPast ? 'Event Ended' : 'Registration'}
              </h2>

              {!isPast && (
                <>
                  {registered ? (
                    <button
                      onClick={handleCancelRegistration}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mb-4"
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isFull || registering}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
                    >
                      {registering ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                    </button>
                  )}

                  {event.status === 'completed' && registered && (
                    <button
                      onClick={() => router.push(`/events/${params.id}/feedback`)}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Give Feedback
                    </button>
                  )}
                </>
              )}

              {isPast && registered && (
                <p className="text-sm text-gray-600 text-center">
                  Thank you for attending!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
