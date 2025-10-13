'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Clerk Sign-In Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white shadow-xl rounded-2xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'border-gray-300 hover:bg-gray-50 transition-colors',
              socialButtonsBlockButtonText: 'font-medium text-gray-700',
              formButtonPrimary:
                'bg-primary hover:bg-primary/90 transition-colors',
              formFieldInput:
                'border-gray-300 focus:border-primary focus:ring-primary',
              footerActionLink:
                'text-primary hover:text-primary/90 font-semibold',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-in"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
