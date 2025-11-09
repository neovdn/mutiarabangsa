'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  Package,
  Receipt,
  BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminNavbarProps {
  userName: string;
}

// Menu navigasi khusus untuk Admin
const adminNavLinks = [
  {
    label: 'Toko',
    href: '/dashboard/admin',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Produk',
    href: '/dashboard/admin/products',
    icon: <Package className="h-4 w-4" />,
  },
  {
    label: 'Transaksi',
    href: '/dashboard/admin/transactions',
    icon: <Receipt className="h-4 w-4" />,
  },
  {
    label: 'Laporan',
    href: '/dashboard/admin/reports',
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

// Helper untuk mendapatkan inisial nama
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function AdminNavbar({ userName }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {' '}
      {/* Shadow tipis seperti permintaan */}
      <nav className="flex items-center justify-between h-16 px-6">
        {/* 1. Logo */}
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <Image
            src="/img/mutirabangsalands.png" // Sesuai permintaan Anda
            alt="Mutiara Bangsa Logo"
            width={160} // Lebar disesuaikan
            height={32} // Tinggi disesuaikan
            priority
          />
        </Link>

        {/* 2. Admin Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {adminNavLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant={pathname === link.href ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'font-medium',
                pathname === link.href
                  ? 'bg-cyan text-primary-foreground' // Menggunakan warna cyan dari Sidebar
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Link href={link.href} className="flex items-center gap-2">
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* 3. User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-cyan-500 text-white font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-black">
                  {userName}
                </p>
                <p className="text-xs leading-none text-gray-500">Admin</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}