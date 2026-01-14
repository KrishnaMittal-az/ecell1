import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const supabase = await createClient();
    const { id: eventId } = await params;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is in the past
    if (new Date(event.event_date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      );
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId);

      if ((registrations?.length || 0) >= event.capacity) {
        return NextResponse.json(
          { error: 'Event is at full capacity' },
          { status: 409 }
        );
      }
    }

    // Register for event
    const { data: registration, error: registerError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
      })
      .select()
      .single();

    if (registerError) {
      return NextResponse.json(
        { error: registerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ registration }, { status: 201 });
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
    const { id: eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || user.id;

    // Check permissions
    if (userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only cancel your own registration' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

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
