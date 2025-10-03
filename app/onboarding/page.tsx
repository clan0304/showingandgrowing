import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import OnboardingForm from '@/components/onboarding-form';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has already completed onboarding
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('onboarding_complete, user_type')
    .eq('id', userId)
    .single();

  if (user?.onboarding_complete) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us a bit about yourself to get started
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
