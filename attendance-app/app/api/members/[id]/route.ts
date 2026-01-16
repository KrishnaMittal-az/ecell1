import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApproved();
    const supabase = await createClient();
    const { id } = await params;

    const { data: profile, error } = await supabase
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
      .eq('user_id', id)
      .eq('users.approved', true)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Member profile not found' },
        { status: 404 }
      );
    }

    // Get skills with details
    const { data: skills } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills (*),
        users!user_skills_endorsed_by_fkey (id, name)
      `)
      .eq('user_id', id);

    // Get achievements with details
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', id);

    // Get attendance statistics
    const { data: attendanceStats } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('user_id', id);

    return NextResponse.json({
      ...profile,
      skills: skills || [],
      achievements: achievements || [],
      attendance_count: attendanceStats?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
