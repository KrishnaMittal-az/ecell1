import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { generateTokenSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const validated = generateTokenSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validated.expiresInDays);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('faculty_view_tokens')
      .insert({
        faculty_id: validated.facultyId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, token: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
