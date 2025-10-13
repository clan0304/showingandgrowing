import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET - Get single job
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update job (business owner only, own jobs only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userType = sessionClaims?.user_type;

  if (userType !== 'business') {
    return NextResponse.json(
      { error: 'Only business owners can update jobs' },
      { status: 403 }
    );
  }

  try {
    // Check if job belongs to user
    const { data: existingJob } = await supabaseAdmin
      .from('jobs')
      .select('business_owner_id')
      .eq('id', params.id)
      .single();

    if (!existingJob || existingJob.business_owner_id !== userId) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }

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

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({
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
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, job: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job (business owner only, own jobs only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userType = sessionClaims?.user_type;

  if (userType !== 'business') {
    return NextResponse.json(
      { error: 'Only business owners can delete jobs' },
      { status: 403 }
    );
  }

  try {
    // Check if job belongs to user
    const { data: existingJob } = await supabaseAdmin
      .from('jobs')
      .select('business_owner_id')
      .eq('id', params.id)
      .single();

    if (!existingJob || existingJob.business_owner_id !== userId) {
      return NextResponse.json(
        { error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { error: 'Failed to delete job' },
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
