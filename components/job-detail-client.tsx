'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Job = {
  id: string;
  business_owner_id: string;
  title: string;
  description: string;
  business_name: string;
  city: string;
  country: string;
  job_date: string | null;
  job_time: string | null;
  created_at: string;
};

type JobDetailClientProps = {
  job: Job;
  hasApplied: boolean;
  hasSaved: boolean;
};

export default function JobDetailClient({
  job,
  hasApplied: initialHasApplied,
  hasSaved: initialHasSaved,
}: JobDetailClientProps) {
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(initialHasApplied);
  const [hasSaved, setHasSaved] = useState(initialHasSaved);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCreatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: job.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply');
      }

      setHasApplied(true);
      toast.success('Your application has been submitted!');
      router.refresh();
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (hasSaved) {
        // Unsave
        const response = await fetch(`/api/saved-jobs?job_id=${job.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to unsave job');
        }

        setHasSaved(false);
        toast.success('Job removed from saved');
      } else {
        // Save
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ job_id: job.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save job');
        }

        setHasSaved(true);
        toast.success('Job saved!');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save job'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/jobs"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Search Results
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {job.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {job.business_name}
                </p>
              </div>
              <div className="flex gap-3 ml-4">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {hasSaved ? 'Saved' : 'Save Job'}
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={loading || hasApplied}
                  className="min-w-[120px] bg-[#FF6B6B] hover:bg-[#FF5252]"
                >
                  {hasApplied ? 'Applied' : 'Apply Now'}
                </Button>
              </div>
            </div>

            <div className="border-b pb-6 mb-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Company Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center pb-4">
                {/* Company Logo/Avatar */}
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {job.business_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-2xl">{job.business_name}</CardTitle>
                <div className="flex items-center justify-center text-gray-600 mt-2">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Hospitality / {job.city}
                </div>
              </CardHeader>

              <CardContent>
                <Button
                  variant="outline"
                  className="w-full mb-6"
                  onClick={() => {
                    // This would go to a business profile page in the future
                    toast.info('Business profiles coming soon!');
                  }}
                >
                  View Profile
                </Button>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Date Listed:
                    </p>
                    <p className="text-gray-600">
                      {formatCreatedDate(job.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Location:
                    </p>
                    <p className="text-gray-600 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      {job.city}, {job.country}
                    </p>
                  </div>

                  {job.job_date && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Job Date:
                      </p>
                      <p className="text-gray-600">
                        {formatDate(job.job_date)}
                      </p>
                    </div>
                  )}

                  {job.job_time && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Job Time:
                      </p>
                      <p className="text-gray-600">{job.job_time}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Salary:
                    </p>
                    <p className="text-gray-600">Not specified</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Industry:
                    </p>
                    <p className="text-gray-600">Hospitality</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Position:
                    </p>
                    <p className="text-gray-600">Content Creator</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Work Type:
                    </p>
                    <p className="text-gray-600">
                      {job.job_date ? 'One-time Project' : 'Flexible'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
