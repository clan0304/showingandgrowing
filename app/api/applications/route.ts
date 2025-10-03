import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST - Apply to a job (creators only)
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

  if (!user || user.user_type !== 'creator') {
    return NextResponse.json(
      { error: 'Only creators can apply to jobs' },
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

    // Check if already applied
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('creator_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id,
        creator_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, application: data },
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
