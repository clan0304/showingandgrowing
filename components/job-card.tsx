import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MapPin, Calendar, Clock, Briefcase, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

type JobCardProps = {
  job: {
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
  showApplyButton?: boolean;
  onApply?: (jobId: string) => void;
  isApplied?: boolean;
  showSaveButton?: boolean;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
};

export default function JobCard({
  job,
  showApplyButton = true,
  onApply,
  isApplied = false,
  showSaveButton = false,
  onSave,
  isSaved = false,
}: JobCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    return timeString;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow relative cursor-pointer">
      {/* Bookmark Icon - Top Right */}
      {showSaveButton && onSave && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(job.id);
          }}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bookmark
            className={`w-5 h-5 ${
              isSaved ? 'fill-primary text-primary' : 'text-gray-400'
            }`}
          />
        </button>
      )}

      <Link href={`/jobs/${job.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-10">
              <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
              <div className="flex items-center text-primary font-semibold mb-2">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.business_name}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            {/* Location */}
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {job.city}, {job.country}
            </div>

            {/* Date */}
            {job.job_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {formatDate(job.job_date)}
              </div>
            )}

            {/* Time */}
            {job.job_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                {formatTime(job.job_time)}
              </div>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="flex gap-2">
        {showApplyButton && onApply && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onApply(job.id);
            }}
            className="flex-1"
            disabled={isApplied}
          >
            {isApplied ? 'Applied' : 'Apply Now'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
