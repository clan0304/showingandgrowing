import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Instagram, Youtube, Video, Globe, Plane } from 'lucide-react';

type CreatorCardProps = {
  creator: {
    username: string;
    bio: string | null;
    city: string;
    country: string;
    instagram_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    other_url: string | null;
    travels?: Array<{
      destination_city: string;
      destination_country: string;
      start_date: string;
      end_date: string;
    }>;
    is_traveling?: boolean;
    matched_via_travel?: boolean; // New prop
  };
};

export default function CreatorCard({ creator }: CreatorCardProps) {
  const socialLinks = [
    { url: creator.instagram_url, icon: Instagram, name: 'Instagram' },
    { url: creator.youtube_url, icon: Youtube, name: 'YouTube' },
    { url: creator.tiktok_url, icon: Video, name: 'TikTok' },
    { url: creator.other_url, icon: Globe, name: 'Website' },
  ].filter((link) => link.url);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Only show travel badge/info if:
  // 1. Creator has travels AND
  // 2. Either no country filter (matched_via_travel is undefined) OR matched via travel
  const shouldShowTravel =
    creator.travels &&
    creator.travels.length > 0 &&
    (creator.matched_via_travel === undefined ||
      creator.matched_via_travel === true);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <Link href={`/creators/${creator.username}`}>
          <div className="mb-4">
            {/* Avatar/Initial */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3 relative">
              <span className="text-2xl font-bold text-white">
                {creator.username.charAt(0).toUpperCase()}
              </span>
              {shouldShowTravel && (
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Plane className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Username */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              @{creator.username}
            </h3>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              {creator.city}, {creator.country}
            </div>

            {/* Travel Badge - Only shown when filtering by travel destination */}
            {shouldShowTravel && (
              <div className="mb-3">
                {creator.travels!.map((travel, index) => (
                  <Badge key={index} variant="secondary" className="mb-1 mr-1">
                    <Plane className="w-3 h-3 mr-1" />
                    Traveling to {travel.destination_city} (
                    {formatDate(travel.start_date)} -{' '}
                    {formatDate(travel.end_date)})
                  </Badge>
                ))}
              </div>
            )}

            {/* Bio */}
            {creator.bio && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {creator.bio}
              </p>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="pt-0">
        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="secondary"
                  className="hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <link.icon className="w-3 h-3 mr-1" />
                  {link.name}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
