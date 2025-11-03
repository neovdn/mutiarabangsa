export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile;
}
