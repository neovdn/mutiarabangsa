import { redirect } from 'next/navigation';

export default function CustomerDashboardPage() {
  // Redirect pengguna ke halaman utama karena Dashboard sekarang ada di Home
  redirect('/');
}