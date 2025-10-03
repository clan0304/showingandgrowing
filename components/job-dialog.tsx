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
import { toast } from 'sonner';
import CountrySearch from '@/components/country-search';

type Job = {
  id: string;
  title: string;
  description: string;
  business_name: string;
  city: string;
  country: string;
  job_date: string | null;
  job_time: string | null;
};

type JobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
};

export default function JobDialog({
  open,
  onOpenChange,
  job = null,
}: JobDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    business_name: '',
    city: '',
    country: '',
    job_date: '',
    job_time: '',
  });

  const isEditing = !!job;

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        business_name: job.business_name,
        city: job.city,
        country: job.country,
        job_date: job.job_date || '',
        job_time: job.job_time || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        business_name: '',
        city: '',
        country: '',
        job_date: '',
        job_time: '',
      });
    }
  }, [job, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (country: string | null) => {
    setFormData((prev) => ({
      ...prev,
      country: country || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.business_name ||
      !formData.city ||
      !formData.country
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${isEditing ? 'update' : 'create'} job`
        );
      }

      toast.success(`Job ${isEditing ? 'updated' : 'posted'} successfully.`);

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${
              isEditing ? 'update' : 'create'
            } job. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Job' : 'Post a New Job'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the job details below'
              : 'Provide information about the content creation opportunity'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Instagram Content Creator for Restaurant Opening"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="business_name"
              name="business_name"
              placeholder="e.g., Joe's Coffee Shop"
              value={formData.business_name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the job, requirements, what you're looking for in a creator, deliverables, etc."
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={5}
            />
          </div>

          {/* Location - City and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., Melbourne"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">
                When should the work be done?
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Country <span className="text-red-500">*</span>
              </Label>
              <CountrySearch
                value={formData.country}
                onSelect={handleCountrySelect}
                placeholder="e.g., Australia"
              />
            </div>
          </div>

          {/* Date and Time (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_date">Date (Optional)</Label>
              <Input
                id="job_date"
                name="job_date"
                type="date"
                value={formData.job_date}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                When should the work be done?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_time">Time (Optional)</Label>
              <Input
                id="job_time"
                name="job_time"
                type="time"
                value={formData.job_time}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                What time should they arrive?
              </p>
            </div>
          </div>

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
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Posting...'
                : isEditing
                ? 'Update Job'
                : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
