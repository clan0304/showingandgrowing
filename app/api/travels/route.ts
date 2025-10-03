import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - Get user's travels
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is a creator
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (!user || user.user_type !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can manage travels' },
        { status: 403 }
      );
    }

    // Get travels (including past ones for reference)
    const { data: travels, error } = await supabaseAdmin
      .from('creator_travels')
      .select('*')
      .eq('creator_id', userId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching travels:', error);
      return NextResponse.json(
        { error: 'Failed to fetch travels' },
        { status: 500 }
      );
    }

    return NextResponse.json({ travels });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new travel
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is a creator
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (!user || user.user_type !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can add travels' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { destination_city, destination_country, start_date, end_date } =
      body;

    // Validate required fields
    if (!destination_city || !destination_country || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Clean up expired travels before adding new one
    await supabaseAdmin
      .from('creator_travels')
      .delete()
      .eq('creator_id', userId)
      .lt('end_date', new Date().toISOString().split('T')[0]);

    // Create travel
    const { data, error } = await supabaseAdmin
      .from('creator_travels')
      .insert({
        creator_id: userId,
        destination_city,
        destination_country,
        start_date,
        end_date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating travel:', error);
      return NextResponse.json(
        { error: 'Failed to create travel' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, travel: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
