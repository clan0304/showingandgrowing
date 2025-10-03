import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check onboarding status
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('onboarding_complete, user_type')
    .eq('id', userId)
    .single();

  if (!user?.onboarding_complete) {
    redirect('/onboarding');
  }

  // Fetch user's jobs if business owner
  let jobs = [];
  if (user.user_type === 'business') {
    const { data: jobsData } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('business_owner_id', userId)
      .order('created_at', { ascending: false });

    jobs = jobsData || [];
  }

  // Fetch user's applications if creator
  let applications = [];
  if (user.user_type === 'creator') {
    const { data: appsData } = await supabaseAdmin
      .from('applications')
      .select(
        `
        *,
        jobs (*)
      `
      )
      .eq('creator_id', userId)
      .order('applied_at', { ascending: false });

    applications = appsData || [];
  }

  return (
    <DashboardClient
      userType={user.user_type}
      jobs={jobs}
      applications={applications}
    />
  );
}
