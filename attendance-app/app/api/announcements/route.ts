import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { createAnnouncementSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireApproved();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const visibility = searchParams.get('visibility');
    const sort = searchParams.get('sort') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('announcements')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        )
      `);

    // Filter by visibility (respect user's year)
    if (visibility) {
      query = query.eq('visibility', visibility);
    } else {
      // Filter based on user's year
      const visibilityConditions = ['all'];
      if (user.year) {
        visibilityConditions.push(user.year);
      }
      query = query.in('visibility', visibilityConditions as any);
    }

    // Sort
    if (sort === 'pinned') {
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data: announcements, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get read status for current user
    const announcementIds = (announcements || []).map((a: any) => a.id);

    let announcementsWithReadStatus = announcements || [];

    if (announcementIds.length > 0) {
      const { data: readStatus } = await supabase
        .from('announcement_reads')
        .select('announcement_id, read_at')
        .eq('user_id', user.id)
        .in('announcement_id', announcementIds);

      const readMap = new Map(
        (readStatus || []).map((r: any) => [r.announcement_id, r.read_at])
      );

      announcementsWithReadStatus = (announcements || []).map((announcement: any) => ({
        ...announcement,
        read_at: readMap.get(announcement.id) || null,
      }));
    }

    return NextResponse.json({ announcements: announcementsWithReadStatus });
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
    const validated = createAnnouncementSchema.parse(body);
    const supabase = await createClient();

    // Check if user is 3rd year or admin
    if (user.role !== 'admin' && user.year !== '3rd_year') {
      return NextResponse.json(
        { error: 'Forbidden: 3rd year members only can create announcements' },
        { status: 403 }
      );
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
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

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
