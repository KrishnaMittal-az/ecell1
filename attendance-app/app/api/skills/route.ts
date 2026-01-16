import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { createSkillSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = supabase
      .from('skills')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('name', { ascending: true });

    const { data: skills, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ skills: skills || [] });
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
    const validated = createSkillSchema.parse(body);
    const supabase = await createClient();

    const { data: skill, error } = await supabase
      .from('skills')
      .insert(validated)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
