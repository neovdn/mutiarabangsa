export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  no_telpon?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_province?: string | null;
  address_postal_code?: string | null;
}

export interface User {
  id: string;
  email: string;
  profile: Profile;
}
