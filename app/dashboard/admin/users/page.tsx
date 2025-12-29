import { createClient } from '@supabase/supabase-js';
import { UserClient } from './user-client';
import { Toaster } from '@/components/ui/toaster';
import { Profile } from '@/types/user';

export const dynamic = 'force-dynamic';

// Interface Data Gabungan (Profile + Email/Status dari Auth)
export interface UserWithMetadata extends Profile {
  email: string;
  is_banned: boolean;
}

// Gunakan Service Role untuk fetch data lengkap (Auth + Profile)
async function getAllUsers(): Promise<UserWithMetadata[]> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch semua user dari Auth (untuk email & status ban)
  // Note: listUsers memiliki pagination, untuk produksi sebaiknya handle loop page.
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000 
  });

  if (authError) {
    console.error('Error fetching auth users:', authError);
    return [];
  }

  // 2. Fetch semua profile
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return [];
  }

  // 3. Gabungkan data
  const mergedUsers: UserWithMetadata[] = profiles.map((profile) => {
    const authUser = users.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || 'Email tidak ditemukan',
      is_banned: authUser?.user_metadata?.banned === true || false,
    };
  });

  return mergedUsers;
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-[1600px]">
        <UserClient initialUsers={users} />
        <Toaster />
      </div>
    </div>
  );
}