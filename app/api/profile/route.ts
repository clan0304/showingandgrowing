import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - Get user profile
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user type
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get profile based on user type
    const table =
      user.user_type === 'creator' ? 'creator_profiles' : 'business_profiles';
    const { data: profile, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile, userType: user.user_type });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      city,
      country,
      bio,
      instagram_url,
      youtube_url,
      tiktok_url,
      other_url,
    } = body;

    // Get user type
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update profile based on user type
    const table =
      user.user_type === 'creator' ? 'creator_profiles' : 'business_profiles';

    // Type the update data properly
    const updateData: {
      city: string;
      country: string;
      bio?: string | null;
      instagram_url?: string | null;
      youtube_url?: string | null;
      tiktok_url?: string | null;
      other_url?: string | null;
    } = {
      city,
      country,
    };

    // Add creator-specific fields
    if (user.user_type === 'creator') {
      updateData.bio = bio || null;
      updateData.instagram_url = instagram_url || null;
      updateData.youtube_url = youtube_url || null;
      updateData.tiktok_url = tiktok_url || null;
      updateData.other_url = other_url || null;
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
