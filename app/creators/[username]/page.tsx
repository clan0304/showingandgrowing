import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { MapPin, Instagram, Youtube, Video, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function CreatorProfilePage(props: Props) {
  const params = await props.params;
  const { username } = params;

  // Fetch creator profile
  const { data: creator, error } = await supabaseAdmin
    .from('creator_profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !creator) {
    notFound();
  }

  const socialLinks = [
    {
      url: creator.instagram_url,
      icon: Instagram,
      name: 'Instagram',
      color: 'text-pink-600',
    },
    {
      url: creator.youtube_url,
      icon: Youtube,
      name: 'YouTube',
      color: 'text-red-600',
    },
    {
      url: creator.tiktok_url,
      icon: Video,
      name: 'TikTok',
      color: 'text-gray-900',
    },
    {
      url: creator.other_url,
      icon: Globe,
      name: 'Website',
      color: 'text-blue-600',
    },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/creators">
          <Button variant="ghost" className="mb-6">
            ← Back to Creators
          </Button>
        </Link>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">
                  {creator.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">
                  @{creator.username}
                </CardTitle>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {creator.city}, {creator.country}
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Badge
                          variant="outline"
                          className="hover:bg-primary hover:text-white transition-colors cursor-pointer px-3 py-1"
                        >
                          <link.icon className={`w-4 h-4 mr-2 ${link.color}`} />
                          {link.name}
                        </Badge>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Bio */}
            {creator.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {creator.bio}
                </p>
              </div>
            )}

            {!creator.bio && !socialLinks.length && (
              <p className="text-gray-500 italic">
                This creator hasn&apos;t added additional details yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <div className="mt-6 text-center text-gray-500">
          <p className="text-sm">
            Want to work with @{creator.username}? Reach out via their social
            media!
          </p>
        </div>
      </div>
    </div>
  );
}
