'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CreatorCard from '@/components/creator-card';
import CountrySearch from '@/components/country-search';
import { Search, X } from 'lucide-react';

type Travel = {
  id: string;
  creator_id: string;
  destination_city: string;
  destination_country: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type Creator = {
  id: string;
  user_id: string;
  username: string;
  bio: string | null;
  city: string;
  country: string;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  other_url: string | null;
  travels?: Travel[];
  is_traveling?: boolean;
  matched_via_travel?: boolean;
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Fetch creators
  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCountry) params.append('country', selectedCountry);

        const response = await fetch(`/api/creators?${params.toString()}`);
        const data = await response.json();
        setCreators(data.creators || []);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchCreators();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCountry]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry(null);
  };

  const hasActiveFilters = searchQuery || selectedCountry;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Content Creators
          </h1>
          <p className="text-gray-600">
            Discover talented creators for your next project
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by username or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Country Search */}
            <div className="w-full md:w-64">
              <CountrySearch
                value={selectedCountry || undefined}
                onSelect={setSelectedCountry}
                placeholder="Filter by country..."
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {searchQuery && (
                <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Search: &quot;{searchQuery}&quot;
                </div>
              )}
              {selectedCountry && (
                <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Country: {selectedCountry}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading creators...</p>
            </div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No creators found
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search filters'
                : 'Be the first to create a profile!'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {creators.length} creator{creators.length !== 1 ? 's' : ''}{' '}
                found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
