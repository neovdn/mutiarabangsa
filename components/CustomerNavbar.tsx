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
import { useState } from 'react';

interface CustomerNavbarProps {
  userName: string;
  cartCount: number | null; // <-- Prop baru
}

// ... (navLinks tetap sama)
const navLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard/customer',
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
    label: 'Riwayat Pesanan',
    href: '/dashboard/customer/history',
    icon: <History className="h-4 w-4" />,
  },
];

// ... (getInitials tetap sama)
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function CustomerNavbar({
  userName,
  cartCount, // <-- Terima prop
}: CustomerNavbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="flex items-center justify-between h-16 px-6">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            {/* ... (SheetTrigger, SheetContent, SheetHeader) ... */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="sr-only">Customer Navigation</SheetTitle>
                <Link
                  href="/dashboard/customer"
                  className="flex items-center gap-2"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Image
                    src="/img/mutirabangsalands.png"
                    alt="Mutiara Bangsa Logo"
                    width={160}
                    height={32}
                    priority
                  />
                </Link>
              </SheetHeader>

              {/* --- Menu Navigasi Mobile Baru --- */}
              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all hover:bg-gray-100',
                      'relative', // <-- Tambahkan 'relative'
                      pathname === link.href
                        ? 'bg-cyan text-primary-foreground hover:bg-cyan'
                        : 'text-gray-600 hover:text-black'
                    )}
                  >
                    {link.icon}
                    {link.label}
                    {/* --- BADGE UNTUK MOBILE --- */}
                    {link.label === 'Keranjang' &&
                      cartCount !== null &&
                      cartCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                          {cartCount}
                        </span>
                      )}
                    {/* ------------------------- */}
                  </Link>
                ))}
              </div>
              {/* ... (Menu Logout) ... */}
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo (Selalu tampil) */}
        <Link
          href="/dashboard/customer"
          className="flex items-center gap-2 ml-4 md:ml-0"
        >
          <Image
            src="/img/mutirabangsalands.png"
            alt="Mutiara Bangsa Logo"
            width={160}
            height={32}
            priority
          />
        </Link>

        {/* --- Customer Navigation Links Desktop Baru --- */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant={pathname === link.href ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'font-medium',
                'relative', // <-- Tambahkan 'relative'
                pathname === link.href
                  ? 'bg-cyan text-primary-foreground'
                  : 'text-gray-600 hover:text-black'
              )}
            >
              <Link href={link.href} className="flex items-center gap-2">
                {link.icon}
                {link.label}
                {/* --- BADGE UNTUK DESKTOP --- */}
                {link.label === 'Keranjang' &&
                  cartCount !== null &&
                  cartCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                      {cartCount}
                    </span>
                  )}
                {/* --------------------------- */}
              </Link>
            </Button>
          ))}
        </div>
        {/* --- Akhir Customer Navigation Links Desktop Baru --- */}

        {/* User Menu (Sama seperti Admin) */}
        <DropdownMenu>
          {/* ... (DropdownMenuTrigger, DropdownMenuContent) ... */}
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
                <p className="text-xs leading-none text-gray-500">Customer</p>
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