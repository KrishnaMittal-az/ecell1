import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { createEventSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const search = searchParams.get('search');

    let query = supabase
      .from('events')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        ),
        event_registrations (id)
      `);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by month
    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      query = query.gte('event_date', startDate.toISOString()).lt('event_date', endDate.toISOString());
    }

    // Search by title
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    query = query.order('event_date', { ascending: true });

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Add registration count
    const eventsWithCount = (events || []).map((event: any) => ({
      ...event,
      registration_count: event.event_registrations?.length || 0,
    }));

    return NextResponse.json({ events: eventsWithCount });
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
    const validated = createEventSchema.parse(body);
    const supabase = await createClient();

    // Check if user is 3rd year or admin
    if (user.role !== 'admin' && user.year !== '3rd_year') {
      return NextResponse.json(
        { error: 'Forbidden: 3rd year members only can create events' },
        { status: 403 }
      );
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
