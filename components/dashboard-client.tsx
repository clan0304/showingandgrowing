'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Plane,
} from 'lucide-react';
import JobDialog from '@/components/job-dialog';
import TravelDialog from '@/components/travel-dialog';
import { toast } from 'sonner';
import Link from 'next/link';

type Job = {
  id: string;
  title: string;
  description: string;
  business_name: string;
  city: string;
  country: string;
  job_date: string | null;
  job_time: string | null;
  created_at: string;
};

type Application = {
  id: string;
  applied_at: string;
  jobs: Job;
};

type Travel = {
  id: string;
  destination_city: string;
  destination_country: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type DashboardClientProps = {
  userType: string;
  jobs?: Job[];
  applications?: Application[];
};

export default function DashboardClient({
  userType,
  jobs = [],
  applications = [],
}: DashboardClientProps) {
  const router = useRouter();

  // Job state
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Travel state
  const [isTravelDialogOpen, setIsTravelDialogOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [deletingTravelId, setDeletingTravelId] = useState<string | null>(null);

  // Fetch travels for creators
  useEffect(() => {
    if (userType === 'creator') {
      fetchTravels();
    }
  }, [userType]);

  const fetchTravels = async () => {
    try {
      const response = await fetch('/api/travels');
      if (response.ok) {
        const data = await response.json();
        setTravels(data.travels || []);
      }
    } catch (error) {
      console.error('Error fetching travels:', error);
    }
  };

  // Job handlers
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsJobDialogOpen(true);
  };

  const handleNewJob = () => {
    setEditingJob(null);
    setIsJobDialogOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this job? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingJobId(jobId);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      toast.success('Job deleted successfully.');
      router.refresh();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job. Please try again.');
    } finally {
      setDeletingJobId(null);
    }
  };

  // Travel handlers
  const handleEditTravel = (travel: Travel) => {
    setEditingTravel(travel);
    setIsTravelDialogOpen(true);
  };

  const handleNewTravel = () => {
    setEditingTravel(null);
    setIsTravelDialogOpen(true);
  };

  const handleDeleteTravel = async (travelId: string) => {
    if (!confirm('Are you sure you want to delete this travel plan?')) {
      return;
    }

    setDeletingTravelId(travelId);

    try {
      const response = await fetch(`/api/travels/${travelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete travel');
      }

      toast.success('Travel plan deleted successfully');
      fetchTravels();
    } catch (error) {
      console.error('Error deleting travel:', error);
      toast.error('Failed to delete travel plan');
    } finally {
      setDeletingTravelId(null);
    }
  };

  const handleTravelDialogClose = (open: boolean) => {
    setIsTravelDialogOpen(open);
    if (!open) {
      fetchTravels(); // Refresh travels when dialog closes
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Business Owner Dashboard
  if (userType === 'business') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
              <p className="text-gray-600">
                Manage your job postings and view applications
              </p>
            </div>
            <Button onClick={handleNewJob}>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs posted yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first job posting to find talented creators
                </p>
                <Button onClick={handleNewJob}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center text-primary font-semibold mb-2">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.business_name}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditJob(job)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJobId === job.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {job.city}, {job.country}
                      </div>
                      {job.job_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(job.job_date)}
                        </div>
                      )}
                      {job.job_time && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {job.job_time}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/jobs/${job.id}/applications`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        View Applications
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Job Dialog */}
        <JobDialog
          open={isJobDialogOpen}
          onOpenChange={setIsJobDialogOpen}
          job={editingJob}
        />
      </div>
    );
  }

  // Creator Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Travel Plans Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Plane className="w-6 h-6 mr-2" />
                My Travel Plans
              </h2>
              <p className="text-gray-600">
                Manage your upcoming travels to appear in search results
              </p>
            </div>
            <Button onClick={handleNewTravel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Travel
            </Button>
          </div>

          {travels.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plane className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No travel plans yet
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  Add your travel plans to appear in search results for those
                  locations
                </p>
                <Button onClick={handleNewTravel}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Travel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {travels.map((travel) => (
                <Card key={travel.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center">
                          <Plane className="w-5 h-5 mr-2 text-primary" />
                          {travel.destination_city},{' '}
                          {travel.destination_country}
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                          {formatLongDate(travel.start_date)} -{' '}
                          {formatLongDate(travel.end_date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Visible in search results from 1 month before start
                          date
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTravel(travel)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTravel(travel.id)}
                          disabled={deletingTravelId === travel.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              My Applications
            </h2>
            <p className="text-gray-600">Track your job applications</p>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Browse available jobs and apply to get started
                </p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">
                      {app.jobs.title}
                    </CardTitle>
                    <div className="flex items-center text-primary font-semibold">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {app.jobs.business_name}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{app.jobs.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {app.jobs.city}, {app.jobs.country}
                      </div>
                      {app.jobs.job_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(app.jobs.job_date)}
                        </div>
                      )}
                      <div className="flex items-center text-green-600">
                        <span className="font-medium">
                          Applied on {formatDate(app.applied_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/jobs/${app.jobs.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Job Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Travel Dialog */}
      <TravelDialog
        open={isTravelDialogOpen}
        onOpenChange={handleTravelDialogClose}
        travel={editingTravel}
      />
    </div>
  );
}
