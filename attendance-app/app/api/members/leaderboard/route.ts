import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: profiles, error } = await supabase
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
      .eq('users.approved', true)
      .order('contribution_score', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ leaderboard: profiles || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
