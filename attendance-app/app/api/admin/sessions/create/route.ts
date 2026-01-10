import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { createSessionSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    
    const validated = createSessionSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + validated.expiresInHours);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        title: validated.title,
        description: validated.description || null,
        expires_at: expiresAt.toISOString(),
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
