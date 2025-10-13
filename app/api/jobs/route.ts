import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - List all jobs (creators only)
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user type from Supabase (more reliable)
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single();

  if (!user || user.user_type !== 'creator') {
    return NextResponse.json(
      { error: 'Only creators can view jobs' },
      { status: 403 }
    );
  }

  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job (business owners only)
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user type from Supabase (more reliable)
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single();

  if (!user || user.user_type !== 'business') {
    return NextResponse.json(
      { error: 'Only business owners can post jobs' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      business_name,
      city,
      country,
      job_date,
      job_time,
      industry,
      payment_range,
      payment_notes,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !business_name ||
      !city ||
      !country ||
      !industry
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        business_owner_id: userId,
        title,
        description,
        business_name,
        city,
        country,
        job_date: job_date || null,
        job_time: job_time || null,
        industry,
        payment_range: payment_range || null,
        payment_notes: payment_notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, job: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
