'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  Store,
  ShoppingCart,
  History,
  Menu,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Profile } from '@/types/user'; // Pastikan tipe ini ada

interface CustomerNavbarProps {
  userProfile: Profile | null; // Data profil user (null jika belum login)
  cartCount: number | null;
}

const navLinks = [
  {
    label: 'Beranda',
    href: '/',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Katalog',
    href: '/dashboard/customer/catalog',
    icon: <Store className="h-4 w-4" />,
  },
  {
    label: 'Keranjang',
    href: '/dashboard/customer/cart',
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    label: 'Riwayat',
    href: '/dashboard/customer/history',
    icon: <History className="h-4 w-4" />,
  },
];

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function CustomerNavbar({
  userProfile,
  cartCount,
}: CustomerNavbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Filter link: Jika belum login, sembunyikan 'Keranjang' dan 'Riwayat' agar user fokus belanja/login dulu
  // (Opsional: kamu bisa tetap menampilkannya dan redirect ke login jika diklik)
  const visibleLinks = userProfile 
    ? navLinks 
    : navLinks.filter(link => link.label === 'Beranda' || link.label === 'Katalog');

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="flex items-center justify-between h-16 px-6 container mx-auto">
        
        {/* 1. MOBILE MENU */}
        <div className="md:hidden flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="px-6 py-4 border-b text-left">
                <Link href="/" onClick={() => setIsSheetOpen(false)}>
                  <Image
                    src="/img/mutirabangsalands.png"
                    alt="Mutiara Bangsa"
                    width={140}
                    height={40}
                    priority
                    className="h-auto w-auto"
                  />
                </Link>
              </SheetHeader>

              <div className="flex flex-col gap-1 p-4">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                      pathname === link.href
                        ? 'bg-cyan/10 text-cyan-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    )}
                  >
                    {link.icon}
                    {link.label}
                    {link.label === 'Keranjang' && cartCount !== null && cartCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
                {userProfile ? (
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-cyan-600 text-white font-bold">
                        {getInitials(userProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-900">
                        {userProfile.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">Customer</p>
                    </div>
                  </div>
                ) : null}
                
                {userProfile ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Masuk</Link>
                    </Button>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700" asChild>
                      <Link href="/register">Daftar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO (Desktop & Mobile) */}
        <Link href="/" className="flex items-center gap-2">
           <Image
            src="/img/mutirabangsalands.png"
            alt="Mutiara Bangsa Logo"
            width={160}
            height={40}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

        {/* 3. DESKTOP MENU LINKS */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/60">
          {visibleLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-full px-4 text-sm font-medium transition-all',
                pathname === link.href
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              )}
            >
              <Link href={link.href} className="flex items-center gap-2">
                {link.label}
                {link.label === 'Keranjang' && cartCount !== null && cartCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white -mr-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          ))}
        </div>

        {/* 4. DESKTOP USER MENU / AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          {userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-2 border-gray-100 hover:border-cyan-200 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs">
                      {getInitials(userProfile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-black">
                      {userProfile.full_name}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      Customer Account
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/customer/history" className="cursor-pointer">
                     <History className="mr-2 h-4 w-4 text-gray-500" />
                     Riwayat Pesanan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/dashboard/customer/cart" className="cursor-pointer">
                     <ShoppingCart className="mr-2 h-4 w-4 text-gray-500" />
                     Keranjang Belanja
                   </Link>
                </DropdownMenuItem>
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
          ) : (
            // Jika belum login
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="font-semibold text-gray-600">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-full px-5" asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
}