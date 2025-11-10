/*
 * File dimodifikasi: components/AdminNavbar.tsx
 * Deskripsi: Memperbarui navigasi dengan menu dropdown "Toko" (Produk & Stok)
 * dan memperbarui menu mobile (Sheet) dengan Accordion.
 */
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
  Menu,
  ChevronDown, // <-- Icon untuk dropdown
  Warehouse,  // <-- Icon baru untuk Stok
  Store,      // <-- Icon baru untuk Toko
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
// Impor Accordion untuk menu mobile
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';

interface AdminNavbarProps {
  userName: string;
}

// --- Navigasi dipecah untuk dropdown ---

// 1. Link biasa
const simpleNavLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: <LayoutDashboard className="h-4 w-4" />,
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

// 2. Link untuk dropdown "Toko"
const tokoDropdownLinks = [
  {
    label: 'Produk',
    href: '/dashboard/admin/products',
    icon: <Package className="h-4 w-4" />,
  },
  {
    label: 'Stok Barang',
    href: '/dashboard/admin/stock',
    icon: <Warehouse className="h-4 w-4" />,
  },
];
// ----------------------------------------

// Helper untuk mendapatkan inisial nama
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function AdminNavbar({ userName }: AdminNavbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Cek apakah salah satu link "Toko" sedang aktif
  const isTokoActive =
    pathname === '/dashboard/admin/products' ||
    pathname === '/dashboard/admin/stock';

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="flex items-center justify-between h-16 px-6">
        {/* Mobile Menu Trigger (Hanya tampil di mobile) */}
        <div className="md:hidden flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <Link
                  href="/dashboard/admin"
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
                {/* 1. Link Dashboard (Biasa) */}
                <Link
                  href="/dashboard/admin"
                  onClick={() => setIsSheetOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all hover:bg-gray-100',
                    pathname === '/dashboard/admin'
                      ? 'bg-cyan text-primary-foreground hover:bg-cyan'
                      : 'text-gray-600 hover:text-black'
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {/* 2. Accordion untuk "Toko" */}
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={isTokoActive ? 'item-1' : undefined}
                >
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all hover:bg-gray-100 hover:no-underline',
                        isTokoActive && 'text-black',
                        !isTokoActive && 'text-gray-600'
                      )}
                    >
                      <Store className="h-4 w-4" />
                      <span className="flex-1 text-left">Toko</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pl-7 space-y-1">
                      {tokoDropdownLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all hover:bg-gray-100',
                            pathname === link.href
                              ? 'bg-cyan text-primary-foreground hover:bg-cyan'
                              : 'text-gray-600 hover:text-black'
                          )}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* 3. Link Sisa (Transaksi, Laporan) */}
                {simpleNavLinks.slice(1).map((
                  link // Mulai dari index 1 (skip dashboard)
                ) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-all hover:bg-gray-100',
                      pathname === link.href
                        ? 'bg-cyan text-primary-foreground hover:bg-cyan'
                        : 'text-gray-600 hover:text-black'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
              {/* --- Akhir Menu Navigasi Mobile Baru --- */}

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
          href="/dashboard/admin"
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

        {/* --- Admin Navigation Links Desktop Baru --- */}
        <div className="hidden md:flex items-center gap-2">
          {/* 1. Link Dashboard */}
          <Button
            asChild
            variant={pathname === '/dashboard/admin' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'font-medium',
              pathname === '/dashboard/admin'
                ? 'bg-cyan text-primary-foreground'
                : 'text-gray-600 hover:text-black'
            )}
          >
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          {/* 2. Dropdown Toko */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isTokoActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'font-medium',
                  isTokoActive
                    ? 'bg-cyan text-primary-foreground'
                    : 'text-gray-600 hover:text-black'
                )}
              >
                <Store className="h-4 w-4 mr-2" />
                Toko
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {tokoDropdownLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      pathname === link.href && 'font-semibold text-cyan-600'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Link Transaksi */}
          <Button
            asChild
            variant={
              pathname === '/dashboard/admin/transactions' ? 'default' : 'ghost'
            }
            size="sm"
            className={cn(
              'font-medium',
              pathname === '/dashboard/admin/transactions'
                ? 'bg-cyan text-primary-foreground'
                : 'text-gray-600 hover:text-black'
            )}
          >
            <Link
              href="/dashboard/admin/transactions"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Transaksi
            </Link>
          </Button>

          {/* 4. Link Laporan */}
          <Button
            asChild
            variant={
              pathname === '/dashboard/admin/reports' ? 'default' : 'ghost'
            }
            size="sm"
            className={cn(
              'font-medium',
              pathname === '/dashboard/admin/reports'
                ? 'bg-cyan text-primary-foreground'
                : 'text-gray-600 hover:text-black'
            )}
          >
            <Link
              href="/dashboard/admin/reports"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Laporan
            </Link>
          </Button>
        </div>
        {/* --- Akhir Admin Navigation Links Desktop Baru --- */}

        {/* User Menu (Tidak berubah) */}
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