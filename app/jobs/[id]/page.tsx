import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import JobDetailClient from '@/components/job-detail-client';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage(props: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check user type
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('user_type, onboarding_complete')
    .eq('id', userId)
    .single();

  if (!user?.onboarding_complete) {
    redirect('/onboarding');
  }

  if (user.user_type !== 'creator') {
    redirect('/dashboard');
  }

  const params = await props.params;

  // Fetch job details
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Check if user has applied
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('job_id', params.id)
    .eq('creator_id', userId)
    .single();

  const hasApplied = !!application;

  // Check if user has saved
  const { data: savedJob } = await supabaseAdmin
    .from('saved_jobs')
    .select('id')
    .eq('job_id', params.id)
    .eq('creator_id', userId)
    .single();

  const hasSaved = !!savedJob;

  return (
    <JobDetailClient job={job} hasApplied={hasApplied} hasSaved={hasSaved} />
  );
}
