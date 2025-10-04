'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/job-card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

type JobsClientProps = {
  appliedJobIds: string[];
  savedJobIds: string[];
};

export default function JobsClient({
  appliedJobIds: initialAppliedJobIds,
  savedJobIds: initialSavedJobIds,
}: JobsClientProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] =
    useState<string[]>(initialAppliedJobIds);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(initialSavedJobIds);
  const router = useRouter();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const response = await fetch('/api/jobs');

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply');
      }

      setAppliedJobIds((prev) => [...prev, jobId]);

      toast.success('Your application has been submitted.');

      router.refresh();
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to apply. Please try again.'
      );
    }
  };

  const handleSave = async (jobId: string) => {
    const isSaved = savedJobIds.includes(jobId);

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-jobs?job_id=${jobId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to unsave job');
        }

        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        toast.success('Job removed from saved.');
      } else {
        // Save
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ job_id: jobId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save job');
        }

        setSavedJobIds((prev) => [...prev, jobId]);
        toast.success('Job saved!');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save job. Please try again.'
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.business_name.toLowerCase().includes(query) ||
      job.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Jobs
          </h1>
          <p className="text-gray-600">
            Find your next content creation opportunity
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, business, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Check back later for new opportunities!'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}{' '}
                available
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  isApplied={appliedJobIds.includes(job.id)}
                  showSaveButton={true}
                  onSave={handleSave}
                  isSaved={savedJobIds.includes(job.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
