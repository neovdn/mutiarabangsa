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
  ChevronDown,
  Warehouse,
  Store,
  Search,
  Bell,
  Settings,
  Users // Update 1: Import Icon Users
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Helper inisial nama
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

  // Update 2: Logika highlight menu Toko diperluas untuk mencakup user management
  // Menggunakan startsWith agar tetap aktif saat masuk ke detail/edit
  const isTokoActive =
    pathname.startsWith('/dashboard/admin/products') ||
    pathname.startsWith('/dashboard/admin/stock') ||
    pathname.startsWith('/dashboard/admin/users');

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <nav className="flex items-center justify-between h-20 px-6 container mx-auto gap-4">
        
        {/* --- BAGIAN KIRI: Logo & Search --- */}
        <div className="flex flex-1 items-center gap-6 justify-start">
          <Link href="/dashboard/admin" className="flex-shrink-0">
             <Image
              src="/img/mutirabangsalands.png"
              alt="Mutiara Bangsa Logo"
              width={180}
              height={50}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          {/* Global Admin Search */}
          <div className="hidden lg:flex relative w-full max-w-xs">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input 
                placeholder="Cari menu, transaksi..." 
                className="pl-9 h-9 bg-gray-50 border-gray-200 focus:ring-cyan-600 focus:border-cyan-600 transition-all"
             />
          </div>
        </div>

        {/* --- BAGIAN TENGAH: Navigasi Utama --- */}
        <div className="hidden md:flex items-center justify-center gap-1">
          <Link
            href="/dashboard/admin"
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
              pathname === '/dashboard/admin'
                ? 'text-cyan-700 bg-cyan-50'
                : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Beranda
          </Link>

          {/* Dropdown Toko */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 outline-none',
                  isTokoActive
                    ? 'text-cyan-700 bg-cyan-50'
                    : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
                )}
              >
                <Store className="h-4 w-4" />
                Toko
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/products" className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4 text-cyan-600" /> Produk
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/stock" className="cursor-pointer">
                  <Warehouse className="mr-2 h-4 w-4 text-cyan-600" /> Stok Barang
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Update 3: Tambah Menu User Management */}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/users" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4 text-cyan-600" /> Manajemen User
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/dashboard/admin/transactions"
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
              pathname === '/dashboard/admin/transactions'
                ? 'text-cyan-700 bg-cyan-50'
                : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
            )}
          >
            <Receipt className="h-4 w-4" />
            Transaksi
          </Link>

          <Link
            href="/dashboard/admin/reports"
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
              pathname === '/dashboard/admin/reports'
                ? 'text-cyan-700 bg-cyan-50'
                : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Laporan
          </Link>
        </div>

        {/* --- BAGIAN KANAN: Notifikasi & Profile --- */}
        <div className="flex flex-1 items-center justify-end gap-3">
          
          {/* Notification Icon */}
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-full">
            <Bell className="h-5 w-5" />
            {/* Dot Notifikasi (Simulasi) */}
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#E8207E] ring-2 ring-white" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-cyan-400 transition-all p-0 overflow-hidden"
              >
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs">
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
                  <p className="text-xs leading-none text-gray-500">
                    Administrator
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:text-cyan-600 hover:bg-cyan-50">
                 <Settings className="mr-2 h-4 w-4" />
                 Pengaturan Akun
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

          {/* MOBILE MENU TRIGGER */}
          <div className="md:hidden flex items-center">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-6 py-4 border-b text-left">
                  <Link href="/dashboard/admin" onClick={() => setIsSheetOpen(false)}>
                    <Image
                      src="/img/mutirabangsalands.png"
                      alt="Mutiara Bangsa"
                      width={150}
                      height={40}
                      priority
                      className="h-auto w-auto"
                    />
                  </Link>
                </SheetHeader>

                <div className="flex flex-col gap-1 p-4">
                  {/* Mobile Search */}
                  <div className="mb-4 relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input 
                        placeholder="Cari..." 
                        className="pl-9 h-9 bg-gray-50 border-gray-200"
                     />
                  </div>

                  <Link
                    href="/dashboard/admin"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  {/* Mobile Accordion Toko */}
                  <Accordion type="single" collapsible className="w-full border-none">
                    <AccordionItem value="toko" className="border-none">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 hover:no-underline transition-all">
                        <div className="flex items-center gap-3">
                          <Store className="h-4 w-4" />
                          Toko
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-10 space-y-1 pb-2">
                        <Link
                          href="/dashboard/admin/products"
                          onClick={() => setIsSheetOpen(false)}
                          className="block py-2 text-sm text-gray-500 hover:text-cyan-600"
                        >
                          Produk
                        </Link>
                        <Link
                          href="/dashboard/admin/stock"
                          onClick={() => setIsSheetOpen(false)}
                          className="block py-2 text-sm text-gray-500 hover:text-cyan-600"
                        >
                          Stok Barang
                        </Link>
                        {/* Update 4: Menu Mobile User */}
                        <Link
                          href="/dashboard/admin/users"
                          onClick={() => setIsSheetOpen(false)}
                          className="block py-2 text-sm text-gray-500 hover:text-cyan-600"
                        >
                          Manajemen User
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Link
                    href="/dashboard/admin/transactions"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                  >
                    <Receipt className="h-4 w-4" />
                    Transaksi
                  </Link>

                  <Link
                    href="/dashboard/admin/reports"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Laporan
                  </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
                   <Button
                     onClick={handleLogout}
                     variant="outline"
                     className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                   >
                     <LogOut className="mr-2 h-4 w-4" />
                     Keluar
                   </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </nav>
    </header>
  );
}