import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { eventFeedbackSchema } from '@/lib/validators';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    const validated = eventFeedbackSchema.parse(body);
    const supabase = await createClient();
    const { id: eventId } = await params;

    // Check if user is registered for the event
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: 'Must be registered to provide feedback' },
        { status: 400 }
      );
    }

    // Check if event is completed
    const { data: event } = await supabase
      .from('events')
      .select('status')
      .eq('id', eventId)
      .single();

    if (!event || event.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only provide feedback for completed events' },
        { status: 400 }
      );
    }

    // Update registration with feedback
    const { data: updatedRegistration, error } = await supabase
      .from('event_registrations')
      .update({
        feedback_score: validated.feedback_score,
        feedback_text: validated.feedback_text || null,
      })
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ registration: updatedRegistration });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
