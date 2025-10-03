import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: creators, error } = await supabaseAdmin
      .from('creator_profiles')
      .select('country');

    if (error) {
      console.error('Error fetching countries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    // Get unique countries
    const countries = [...new Set(creators.map((c) => c.country))].sort();

    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
