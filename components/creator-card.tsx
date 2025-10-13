'use client';

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
    matched_via_travel?: boolean;
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

  const shouldShowTravel =
    creator.travels &&
    creator.travels.length > 0 &&
    (creator.matched_via_travel === undefined ||
      creator.matched_via_travel === true);

  return (
    <Card className="group hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden h-full flex flex-col">
      <CardContent className="pb-6 flex-1">
        <Link href={`/creators/${creator.username}`} className="block">
          <div className="space-y-4">
            <div className="relative w-20 h-20 mb-2">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">
                  {creator.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {shouldShowTravel && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5 shadow-md ring-2 ring-white">
                  <Plane className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                @{creator.username}
              </h3>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  {creator.city}, {creator.country}
                </span>
              </div>
            </div>

            {shouldShowTravel && (
              <div className="flex flex-wrap gap-2">
                {creator.travels!.map((travel, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-3 py-1.5 text-xs font-medium"
                  >
                    <Plane className="w-3 h-3 mr-1.5" />
                    <span>
                      {travel.destination_city} ·{' '}
                      {formatDate(travel.start_date)} -{' '}
                      {formatDate(travel.end_date)}
                    </span>
                  </Badge>
                ))}
              </div>
            )}

            {creator.bio && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {creator.bio}
              </p>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="pt-4 pb-6 border-t bg-muted/30">
        {socialLinks.length > 0 && (
          <div className="flex gap-2 flex-wrap w-full">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-fit"
              >
                <Badge
                  variant="secondary"
                  className="w-full justify-center hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-200 cursor-pointer py-2 px-3 font-medium shadow-sm"
                >
                  <link.icon className="w-3.5 h-3.5 mr-1.5" />
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
