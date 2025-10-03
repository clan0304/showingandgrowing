import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

type CreatorProfile = {
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
  created_at: string;
  updated_at: string;
};

type Travel = {
  id: string;
  creator_id: string;
  destination_city: string;
  destination_country: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type EnhancedCreator = CreatorProfile & {
  travels: Travel[];
  is_traveling: boolean;
  matched_via_travel: boolean; // New flag
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';

    const today = new Date().toISOString().split('T')[0];
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const oneMonthDate = oneMonthFromNow.toISOString().split('T')[0];

    // Get all creators
    let query = supabaseAdmin
      .from('creator_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const { data: creators, error } = await query;

    if (error) {
      console.error('Error fetching creators:', error);
      return NextResponse.json(
        { error: 'Failed to fetch creators' },
        { status: 500 }
      );
    }

    // Get active travels (visible period: start_date - 30 days to end_date)
    const { data: travels } = await supabaseAdmin
      .from('creator_travels')
      .select('*')
      .lte('start_date', oneMonthDate)
      .gte('end_date', today);

    // Create a map of creator travels
    const travelMap = new Map<string, Travel[]>();
    travels?.forEach((travel) => {
      if (!travelMap.has(travel.creator_id)) {
        travelMap.set(travel.creator_id, []);
      }
      travelMap.get(travel.creator_id)!.push(travel);
    });

    // Enhance creators with travel info
    let enhancedCreators: EnhancedCreator[] = (creators || []).map(
      (creator) => {
        const creatorTravels = travelMap.get(creator.user_id) || [];

        return {
          ...creator,
          travels: creatorTravels,
          is_traveling: creatorTravels.length > 0,
          matched_via_travel: false, // Default to false
        };
      }
    );

    // Apply country filter
    if (country) {
      enhancedCreators = enhancedCreators.filter((creator) => {
        // Match home country
        const matchesHomeCountry = creator.country === country;

        // Match travel destination
        const matchingTravels = creator.travels.filter(
          (travel) => travel.destination_country === country
        );
        const matchesTravelCountry = matchingTravels.length > 0;

        // If matches via travel, set flag and filter travels to only matching ones
        if (matchesTravelCountry) {
          creator.matched_via_travel = true;
          creator.travels = matchingTravels; // Only show travels to this country
        } else {
          creator.matched_via_travel = false;
          creator.travels = []; // Don't show travels when matched via home country
        }

        return matchesHomeCountry || matchesTravelCountry;
      });
    }

    return NextResponse.json({ creators: enhancedCreators });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
