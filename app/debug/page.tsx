import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export default async function DebugPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return <div>Not signed in</div>;
  }

  // Get user from Supabase
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded border">
          <h2 className="font-bold mb-2">User ID from Clerk:</h2>
          <pre>{userId}</pre>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-bold mb-2">Session Claims:</h2>
          <pre>{JSON.stringify(sessionClaims, null, 2)}</pre>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-bold mb-2">User from Supabase:</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
