import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST - Save a job
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is a creator
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single();

  if (!user || user.user_type !== 'creator') {
    return NextResponse.json(
      { error: 'Only creators can save jobs' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabaseAdmin
      .from('saved_jobs')
      .select('id')
      .eq('job_id', job_id)
      .eq('creator_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Job already saved' }, { status: 400 });
    }

    // Save job
    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .insert({
        job_id,
        creator_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving job:', error);
      return NextResponse.json(
        { error: 'Failed to save job' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, savedJob: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a job
export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const job_id = searchParams.get('job_id');

    if (!job_id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('job_id', job_id)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error unsaving job:', error);
      return NextResponse.json(
        { error: 'Failed to unsave job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
