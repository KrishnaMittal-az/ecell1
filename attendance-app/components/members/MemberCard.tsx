import Link from 'next/link';
import { User, Award } from 'lucide-react';

interface MemberCardProps {
  id: string;
  name: string;
  email: string;
  year: string;
  bio: string | null;
  skills: any[];
  achievements: any[];
  contribution_score: number;
  profile_image_url: string | null;
}

export default function MemberCard({
  id,
  name,
  email,
  year,
  bio,
  skills,
  achievements,
  contribution_score,
  profile_image_url,
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {profile_image_url ? (
            <img
              src={profile_image_url}
              alt={name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/members/${id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {name}
            </Link>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {year.replace('_', ' ')}
            </span>
          </div>

          {bio && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{bio}</p>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.slice(0, 3).map((skill: any) => (
                <span
                  key={skill.skill_id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {skill.skills?.name}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-xs text-gray-500">+{skills.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{contribution_score} pts</span>
              </div>
              {achievements.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">🏆</span>
                  <span>{achievements.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
