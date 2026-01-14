import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validators';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireApproved();
    const body = await request.json();

    const validated = updateProfileSchema.parse(body);
    const supabase = await createClient();

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('member_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (!existingProfile) {
      // Create new profile
      const { data, error } = await supabase
        .from('member_profiles')
        .insert({
          user_id: user.id,
          ...validated,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Update existing profile
      const { data, error } = await supabase
        .from('member_profiles')
        .update(validated)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({ profile: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
