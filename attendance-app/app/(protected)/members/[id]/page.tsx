'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Linkedin, Phone, Award, Calendar, Star } from 'lucide-react';

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [params.id]);

  const fetchMember = async () => {
    try {
      const response = await fetch(`/api/members/${params.id}`);
      const data = await response.json();
      setMember(data);
    } catch (error) {
      console.error('Error fetching member:', error);
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

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Member not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt={member.users?.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {member.users?.name}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {member.users?.year?.replace('_', ' ')}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{member.email}</p>

              {member.bio && (
                <p className="text-gray-700 mb-4">{member.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{member.contribution_score} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{member.attendance_count} attended</span>
                </div>
                {member.achievements && member.achievements.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{member.achievements.length} badges</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
          {member.skills && member.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.skills.map((skill: any) => (
                <div
                  key={skill.skill_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {skill.skills?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {skill.skills?.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < skill.proficiency
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill={i < skill.proficiency ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills endorsed yet</p>
          )}
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Achievements
          </h2>
          {member.achievements && member.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.achievements.map((ua: any) => (
                <div
                  key={ua.achievement_id}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">
                      {ua.achievements?.icon_url || '🏆'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ua.achievements?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {ua.achievements?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Earned: {new Date(ua.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No achievements earned yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
