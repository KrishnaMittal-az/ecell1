import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { updateAnnouncementSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApproved();
    const supabase = await createClient();
    const { id } = await params;

    const { data: announcement, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users!inner (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error || !announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Check visibility
    if (
      announcement.visibility !== 'all' &&
      announcement.visibility !== user.year
    ) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this announcement' },
        { status: 403 }
      );
    }

    // Mark as read
    await supabase
      .from('announcement_reads')
      .upsert({
        announcement_id: id,
        user_id: user.id,
        read_at: new Date().toISOString(),
      });

    return NextResponse.json({ announcement });
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
    const validated = updateAnnouncementSchema.parse(body);
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is creator or admin
    const { data: announcement } = await supabase
      .from('announcements')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    if (announcement.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only update your own announcements' },
        { status: 403 }
      );
    }

    const { data: updatedAnnouncement, error } = await supabase
      .from('announcements')
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

    return NextResponse.json({ announcement: updatedAnnouncement });
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
    const { data: announcement } = await supabase
      .from('announcements')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    if (announcement.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only delete your own announcements' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('announcements')
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
