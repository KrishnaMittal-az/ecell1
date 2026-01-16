import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { endorseSkillSchema } from '@/lib/validators';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    const validated = endorseSkillSchema.parse(body);
    const { id: targetUserId } = await params;
    const supabase = await createClient();

    // Check if trying to endorse self
    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot endorse your own skills' },
        { status: 400 }
      );
    }

    // Check if skill exists
    const { data: skill } = await supabase
      .from('skills')
      .select('id')
      .eq('id', validated.skill_id)
      .single();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Insert or update skill endorsement
    const { data: userSkill, error } = await supabase
      .from('user_skills')
      .upsert({
        user_id: targetUserId,
        skill_id: validated.skill_id,
        proficiency: validated.proficiency,
        endorsed_by: user.id,
      })
      .select(`
        *,
        skills (*),
        users!user_skills_endorsed_by_fkey (id, name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ skill: userSkill }, { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const skillId = searchParams.get('skill_id');
    const { id: targetUserId } = await params;
    const supabase = await createClient();

    if (!skillId) {
      return NextResponse.json(
        { error: 'skill_id is required' },
        { status: 400 }
      );
    }

    // Check if user can delete (own skill entry or admin)
    const { data: userSkill } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('skill_id', skillId)
      .single();

    if (!userSkill) {
      return NextResponse.json(
        { error: 'Skill endorsement not found' },
        { status: 404 }
      );
    }

    if (user.id !== targetUserId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only delete your own skill endorsements' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', targetUserId)
      .eq('skill_id', skillId);

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
