import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// DELETE - Delete travel
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if travel belongs to user
    const { data: travel } = await supabaseAdmin
      .from('creator_travels')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (!travel || travel.creator_id !== userId) {
      return NextResponse.json(
        { error: 'Travel not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('creator_travels')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting travel:', error);
      return NextResponse.json(
        { error: 'Failed to delete travel' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update travel
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if travel belongs to user
    const { data: existingTravel } = await supabaseAdmin
      .from('creator_travels')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (!existingTravel || existingTravel.creator_id !== userId) {
      return NextResponse.json(
        { error: 'Travel not found or unauthorized' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { destination_city, destination_country, start_date, end_date } =
      body;

    // Validate dates if both provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('creator_travels')
      .update({
        destination_city,
        destination_country,
        start_date,
        end_date,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating travel:', error);
      return NextResponse.json(
        { error: 'Failed to update travel' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, travel: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
