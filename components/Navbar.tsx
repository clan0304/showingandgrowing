'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">CreatorHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/creators"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Find Creators
            </Link>

            {isSignedIn && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <span className="hidden md:block text-sm text-gray-700">
                  {user?.firstName || user?.username || 'User'}
                </span>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-in">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
