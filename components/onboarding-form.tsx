'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, Camera } from 'lucide-react';

type UserType = 'creator' | 'business' | null;

export default function OnboardingForm() {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    city: '',
    country: '',
    bio: '',
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    other_url: '',
  });

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep('form');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Force a full page reload to refresh the session
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  // ... rest of the component stays the same
  // Step 1: User Type Selection
  if (step === 'select') {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleUserTypeSelect('creator')}
        >
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Content Creator</CardTitle>
            <CardDescription>
              Showcase your work and apply for exciting opportunities with local
              businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Create a public profile</li>
              <li>✓ Apply for jobs</li>
              <li>✓ Connect with businesses</li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleUserTypeSelect('business')}
        >
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Business Owner</CardTitle>
            <CardDescription>
              Find talented content creators for your restaurant, cafe, or local
              business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Post job opportunities</li>
              <li>✓ Review applications</li>
              <li>✓ Discover local talent</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Form based on user type
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userType === 'creator' ? 'Creator Profile' : 'Business Profile'}
        </CardTitle>
        <CardDescription>
          {userType === 'creator'
            ? 'Tell businesses about yourself and your content'
            : 'Set up your business account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="e.g., johndoe"
              value={formData.username}
              onChange={handleInputChange}
              required
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
            <p className="text-xs text-gray-500">
              This will be your public display name
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., New York"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                name="country"
                placeholder="e.g., United States"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Creator-Specific Fields */}
          {userType === 'creator' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell businesses about your content style, niche, and what makes you unique..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-gray-500 text-right">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="space-y-4">
                <Label>Social Media Links (Optional)</Label>

                <div className="space-y-2">
                  <Label
                    htmlFor="instagram_url"
                    className="text-sm font-normal"
                  >
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram_url"
                    name="instagram_url"
                    type="url"
                    placeholder="https://instagram.com/yourusername"
                    value={formData.instagram_url}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="text-sm font-normal">
                    YouTube URL
                  </Label>
                  <Input
                    id="youtube_url"
                    name="youtube_url"
                    type="url"
                    placeholder="https://youtube.com/@yourusername"
                    value={formData.youtube_url}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_url" className="text-sm font-normal">
                    TikTok URL
                  </Label>
                  <Input
                    id="tiktok_url"
                    name="tiktok_url"
                    type="url"
                    placeholder="https://tiktok.com/@yourusername"
                    value={formData.tiktok_url}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_url" className="text-sm font-normal">
                    Other URL (Portfolio, Website, etc.)
                  </Label>
                  <Input
                    id="other_url"
                    name="other_url"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.other_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('select');
                setUserType(null);
                setFormData({
                  username: '',
                  city: '',
                  country: '',
                  bio: '',
                  instagram_url: '',
                  youtube_url: '',
                  tiktok_url: '',
                  other_url: '',
                });
              }}
              disabled={loading}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
