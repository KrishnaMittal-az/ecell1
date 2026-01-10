import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { markAttendanceSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    
    const validated = markAttendanceSchema.parse(body);
    const supabase = await createClient();

    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('id, expires_at')
      .eq('qr_token', validated.qrToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This session has expired' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_id', session.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from('attendance_logs')
      .insert({
        user_id: user.id,
        session_id: session.id,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
