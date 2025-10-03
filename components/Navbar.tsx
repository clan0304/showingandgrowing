'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import ProfileDropdown from '@/components/profile-dropdown';
import ProfileEditDialog from '@/components/profile-edit-dialog';

type ProfileData = {
  username: string;
  city: string;
  country: string;
  bio?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  other_url?: string;
};

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userType, setUserType] = useState<'creator' | 'business' | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        setUserType(data.userType);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  // Fetch profile data when signed in (only once)
  useEffect(() => {
    if (isSignedIn && !profileData) {
      fetchProfile();
    }
  }, [isSignedIn, profileData, fetchProfile]);

  const handleProfileClick = () => {
    setIsProfileDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsProfileDialogOpen(open);
    // Refetch profile when dialog closes to get updated data
    if (!open) {
      fetchProfile();
    }
  };

  return (
    <>
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                CreatorHub
              </span>
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
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/jobs"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Jobs
                  </Link>
                </>
              )}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isSignedIn && profileData ? (
                <ProfileDropdown
                  username={profileData.username}
                  userType={userType || 'user'}
                  onProfileClick={handleProfileClick}
                />
              ) : isSignedIn ? (
                <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full" />
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

      {/* Profile Edit Dialog */}
      {profileData && userType && (
        <ProfileEditDialog
          open={isProfileDialogOpen}
          onOpenChange={handleDialogClose}
          userType={userType}
          initialData={profileData}
        />
      )}
    </>
  );
}
