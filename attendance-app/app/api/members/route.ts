import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { MemberProfileWithUser, UserSkillWithDetails, UserAchievementWithDetails } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const skill = searchParams.get('skill');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'contribution';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('member_profiles')
      .select(`
        *,
        users!inner (
          id,
          name,
          email,
          year,
          role,
          approved
        )
      `)
      .eq('users.approved', true);

    // Filter by year
    if (year) {
      query = query.eq('users.year', year);
    }

    // Filter by skill
    if (skill) {
      query = query.overlaps('users.skills', [skill]);
    }

    // Search by name
    if (search) {
      query = query.ilike('users.name', `%${search}%`);
    }

    // Sort
    if (sort === 'contribution') {
      query = query.order('contribution_score', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('users.name', { ascending: true });
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    // Limit
    query = query.limit(limit);

    const { data: profiles, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get skills and achievements for each member
    const membersWithDetails = await Promise.all(
      (profiles || []).map(async (profile: any) => {
        const [skillsResult, achievementsResult] = await Promise.all([
          supabase
            .from('user_skills')
            .select(`
              *,
              skills (*)
            `)
            .eq('user_id', profile.user_id),
          supabase
            .from('user_achievements')
            .select(`
              *,
              achievements (*)
            `)
            .eq('user_id', profile.user_id)
        ]);

        return {
          ...profile,
          skills: skillsResult.data || [],
          achievements: achievementsResult.data || [],
        };
      })
    );

    return NextResponse.json({ members: membersWithDetails });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
