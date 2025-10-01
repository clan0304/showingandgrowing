import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Insert user into Supabase using admin client
    const { error } = await supabaseAdmin.from('users').insert({
      id: id,
      email: email_addresses[0].email_address,
      first_name: first_name || null,
      last_name: last_name || null,
      user_type: null,
      onboarding_complete: false,
    });

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return new Response('Error creating user', { status: 500 });
    }

    console.log(`User ${id} created successfully`);
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        first_name: first_name || null,
        last_name: last_name || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user in Supabase:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
