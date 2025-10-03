import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      userType,
      username,
      city,
      country,
      bio,
      instagram_url,
      youtube_url,
      tiktok_url,
      other_url,
    } = body;

    // Validate user type
    if (!['creator', 'business'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    // Validate required fields
    if (!username || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists in Supabase, if not create it
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // User doesn't exist yet (webhook hasn't fired or completed)
      // Get user data from Clerk
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);

      // Create user in Supabase
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          first_name: clerkUser.firstName || null,
          last_name: clerkUser.lastName || null,
          user_type: null,
          onboarding_complete: false,
        });

      if (createUserError) {
        console.error('Error creating user in Supabase:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }

      console.log(`User ${userId} created in Supabase during onboarding`);
    }

    // Check if username is unique across both profile tables
    const { data: existingCreator } = await supabaseAdmin
      .from('creator_profiles')
      .select('username')
      .eq('username', username)
      .single();

    const { data: existingBusiness } = await supabaseAdmin
      .from('business_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingCreator || existingBusiness) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create profile based on user type
    if (userType === 'creator') {
      const { error: profileError } = await supabaseAdmin
        .from('creator_profiles')
        .insert({
          user_id: userId,
          username,
          bio: bio || null,
          city,
          country,
          instagram_url: instagram_url || null,
          youtube_url: youtube_url || null,
          tiktok_url: tiktok_url || null,
          other_url: other_url || null,
        });

      if (profileError) {
        console.error('Error creating creator profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
    } else {
      const { error: profileError } = await supabaseAdmin
        .from('business_profiles')
        .insert({
          user_id: userId,
          username,
          city,
          country,
        });

      if (profileError) {
        console.error('Error creating business profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
    }

    // Update users table
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        user_type: userType,
        onboarding_complete: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: userType,
        onboarding_complete: true,
      },
    });

    return NextResponse.json({
      success: true,
      userType,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
