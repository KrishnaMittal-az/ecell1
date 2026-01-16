import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { awardAchievementSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApproved();
    const supabase = await createClient();
    const { id } = await params;

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', id)
      .order('earned_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ achievements: achievements || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    const validated = awardAchievementSchema.parse(body);
    const supabase = await createClient();
    const { id: targetUserId } = await params;

    // Only admins can award achievements
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Check if achievement exists
    const { data: achievement } = await supabase
      .from('achievements')
      .select('id')
      .eq('id', validated.achievement_id)
      .single();

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Award achievement
    const { data: userAchievement, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: targetUserId,
        achievement_id: validated.achievement_id,
      })
      .select(`
        *,
        achievements (*)
      `)
      .single();

    if (error) {
      // Check if duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User already has this achievement' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ achievement: userAchievement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const supabase = await createClient();
    const { id: targetUserId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const achievementId = searchParams.get('achievement_id');

    if (!achievementId) {
      return NextResponse.json(
        { error: 'achievement_id is required' },
        { status: 400 }
      );
    }

    // Only admins can remove achievements
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', targetUserId)
      .eq('achievement_id', achievementId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
