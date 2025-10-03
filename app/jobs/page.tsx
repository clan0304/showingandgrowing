import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import JobsClient from '@/components/jobs-client';

export default async function JobsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user type from Supabase (more reliable than JWT during development)
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('user_type, onboarding_complete')
    .eq('id', userId)
    .single();

  if (!user?.onboarding_complete) {
    redirect('/onboarding');
  }

  // Check if user is a creator
  if (user.user_type !== 'creator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only content creators can view job listings.
          </p>
        </div>
      </div>
    );
  }

  // Get user's applications
  const { data: applications } = await supabaseAdmin
    .from('applications')
    .select('job_id')
    .eq('creator_id', userId);

  const appliedJobIds = applications?.map((app) => app.job_id) || [];

  return <JobsClient appliedJobIds={appliedJobIds} />;
}
