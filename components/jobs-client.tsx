'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/job-card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

type FilterType = 'saved' | 'applied' | null;

export default function JobsClient({
  appliedJobIds: initialAppliedJobIds,
  savedJobIds: initialSavedJobIds,
}: JobsClientProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
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

  const handleFilterToggle = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // Apply filters
  const filteredJobs = jobs.filter((job) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.business_name.toLowerCase().includes(query) ||
        job.city.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (activeFilter === 'saved') {
      return savedJobIds.includes(job.id);
    }

    if (activeFilter === 'applied') {
      return appliedJobIds.includes(job.id);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Jobs</h1>
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

      {/* Filter Tabs */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto">
            <Button
              variant={activeFilter === null ? 'default' : 'outline'}
              onClick={() => setActiveFilter(null)}
              className="rounded-full px-6"
            >
              All
            </Button>

            <Button
              variant={activeFilter === 'saved' ? 'default' : 'outline'}
              onClick={() => handleFilterToggle('saved')}
              className="rounded-full px-6"
            >
              Saved
            </Button>

            <Button
              variant={activeFilter === 'applied' ? 'default' : 'outline'}
              onClick={() => handleFilterToggle('applied')}
              className="rounded-full px-6"
            >
              Applied
            </Button>
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
              {activeFilter === 'saved'
                ? "You haven't saved any jobs yet"
                : activeFilter === 'applied'
                ? "You haven't applied to any jobs yet"
                : searchQuery
                ? 'Try adjusting your search query'
                : 'Check back later for new opportunities!'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}{' '}
                {activeFilter === 'saved'
                  ? 'saved'
                  : activeFilter === 'applied'
                  ? 'applied'
                  : 'available'}
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
