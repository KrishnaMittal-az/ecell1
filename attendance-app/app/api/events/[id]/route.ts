import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { updateEventSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApproved();
    const supabase = await createClient();
    const { id } = await params;

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        ),
        event_registrations (
          *,
          users (
            id,
            name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const body = await request.json();
    const validated = updateEventSchema.parse(body);
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is creator or admin
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only update your own events' },
        { status: 403 }
      );
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: updatedEvent });
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
    const { id } = await params;

    // Check if user is creator or admin
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only delete your own events' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

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
