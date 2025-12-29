import { createClient } from '@supabase/supabase-js';
import { UserClient } from './user-client';
import { Toaster } from '@/components/ui/toaster';
import { Profile } from '@/types/user';

export const dynamic = 'force-dynamic'; // Memaksa server untuk tidak menyimpan cache

// Interface
export interface UserWithMetadata extends Profile {
  email: string;
  is_banned: boolean;
}

async function getAllUsers(): Promise<UserWithMetadata[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // --- DEBUGGING LOGS (Cek Terminal VS Code Anda) ---
  console.log("--- DEBUG START ---");
  console.log("1. URL Supabase:", supabaseUrl ? "OK" : "MISSING");
  console.log("2. Service Role Key:", serviceRoleKey ? `Ada (${serviceRoleKey.substring(0, 10)}...)` : "MISSING/UNDEFINED");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("CRITICAL ERROR: URL atau Service Role Key tidak ditemukan di .env");
    return [];
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1. Fetch Users dari Auth
  const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authError) {
    console.error("ERROR FETCHING AUTH USERS:", authError.message);
    return []; // Jika error auth, kembalikan array kosong
  }

  const users = data?.users || [];
  console.log(`3. Total Auth Users ditemukan: ${users.length}`);

  // 2. Fetch Profiles
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (profileError) {
    console.error("ERROR FETCHING PROFILES:", profileError.message);
  } else {
    console.log(`4. Total Profiles ditemukan: ${profiles?.length || 0}`);
  }

  // 3. Gabungkan Data
  const mergedUsers: UserWithMetadata[] = users.map((user) => {
    const profile = profiles?.find((p) => p.id === user.id);
    
    // Fix TypeScript error dengan (user as any)
    const bannedUntil = (user as any).banned_until; 
    const isBanned = bannedUntil ? new Date(bannedUntil) > new Date() : false;

    return {
      id: user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || 'Tanpa Nama',
      role: profile?.role || user.user_metadata?.role || 'customer',
      email: user.email || 'Email tidak ditemukan',
      no_telpon: profile?.no_telpon || null,
      address_street: profile?.address_street || null,
      address_city: profile?.address_city || null,
      address_province: profile?.address_province || null,
      address_postal_code: profile?.address_postal_code || null,
      created_at: profile?.created_at || user.created_at,
      is_banned: isBanned,
    };
  });

  console.log("--- DEBUG END ---");
  return mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-[1600px]">
        {/* Tampilkan pesan error di UI jika data kosong untuk memastikan */}
        {users.length === 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-4" role="alert">
                <strong className="font-bold">Data Kosong! </strong>
                <span className="block sm:inline">Cek terminal VS Code Anda untuk melihat log debug.</span>
            </div>
        )}
        <UserClient initialUsers={users} />
        <Toaster />
      </div>
    </div>
  );
}