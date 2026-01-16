import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { createAchievementSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      // Get single achievement with users who earned it
      const { data: achievement, error } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements (
            earned_at,
            users (
              id,
              name,
              email
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error || !achievement) {
        return NextResponse.json(
          { error: 'Achievement not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ achievement });
    } else {
      // Get all achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ achievements: achievements || [] });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    const validated = createAchievementSchema.parse(body);
    const supabase = await createClient();

    // Only admins can create achievements
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { data: achievement, error } = await supabase
      .from('achievements')
      .insert(validated)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ achievement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
