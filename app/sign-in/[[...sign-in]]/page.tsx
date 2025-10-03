'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? 'Sign up to get started with CreatorHub'
              : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        {/* Clerk Component */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {isSignUp ? (
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                  socialButtonsBlockButtonText: 'font-medium',
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerAction: 'hidden',
                },
              }}
              routing="path"
              path="/sign-in"
              signInUrl="/sign-in"
              redirectUrl="/onboarding"
            />
          ) : (
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                  socialButtonsBlockButtonText: 'font-medium',
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerAction: 'hidden',
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-in"
              redirectUrl="/"
            />
          )}

          {/* Toggle Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
