'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

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

type ProfileEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'creator' | 'business';
  initialData: ProfileData;
};

export default function ProfileEditDialog({
  open,
  onOpenChange,
  userType,
  initialData,
}: ProfileEditDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Avatar Display */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-3xl">
                {formData.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Username - Display Only */}
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={`@${formData.username}`}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Username cannot be changed</p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
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
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                  placeholder="Tell businesses about your content style..."
                />
                <p className="text-xs text-gray-500 text-right">
                  {(formData.bio || '').length}/500 characters
                </p>
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>

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
                    value={formData.instagram_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourusername"
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
                    value={formData.youtube_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/@yourusername"
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
                    value={formData.tiktok_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_url" className="text-sm font-normal">
                    Other URL
                  </Label>
                  <Input
                    id="other_url"
                    name="other_url"
                    type="url"
                    value={formData.other_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
