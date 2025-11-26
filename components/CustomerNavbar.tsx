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
  Search,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { cn, formatCurrency } from '@/lib/utils';
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { Profile } from '@/types/user';

// Definisi tipe data item keranjang untuk navbar
export type NavbarCartItem = {
  id: string;
  quantity: number;
  product_variants: {
    price: number;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

interface CustomerNavbarProps {
  userProfile: Profile | null;
  cartItems?: NavbarCartItem[]; // Opsional dengan default value di function
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
  cartItems = [], // <--- PERBAIKAN: Default value [] mencegah error reduce
}: CustomerNavbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchFeature, setSearchFeature] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Safety check agar cartItems selalu array
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const cartCount = safeCartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = safeCartItems.reduce((acc, item) => {
    return acc + (item.product_variants?.price || 0) * item.quantity;
  }, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      {/* Menggunakan layout Flexbox 3 bagian:
        1. Kiri (Flex-1): Logo & Search
        2. Tengah (Auto): Menu Navigasi
        3. Kanan (Flex-1): Cart & Profile
      */}
      <nav className="flex items-center h-20 px-6 container mx-auto">
        
        {/* --- BAGIAN KIRI: Logo & Search --- */}
        <div className="flex flex-1 items-center gap-6 justify-start">
          <Link href="/" className="flex-shrink-0">
             <Image
              src="/img/mutirabangsalands.png"
              alt="Mutiara Bangsa Logo"
              width={180}
              height={50}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          {/* Search Fitur (Hanya Desktop) */}
          <div className="hidden lg:flex relative w-full max-w-xs">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input 
                placeholder="Cari fitur..." 
                className="pl-9 h-9 bg-gray-50 border-gray-200 focus:ring-[#E8207E] focus:border-[#E8207E] transition-all"
                value={searchFeature}
                onChange={(e) => setSearchFeature(e.target.value)}
             />
          </div>
        </div>

        {/* --- BAGIAN TENGAH: Navigasi Utama --- */}
        <div className="hidden md:flex items-center justify-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                pathname === link.href
                  ? 'text-[#E8207E] bg-[#E8207E]/10' // Active Pink
                  : 'text-gray-600 hover:text-[#E8207E] hover:bg-gray-50' // Hover Pink
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* --- BAGIAN KANAN: Cart & Profile --- */}
        <div className="flex flex-1 items-center justify-end gap-4">
          
          {/* Cart Icon dengan Hover Preview */}
          {userProfile && (
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Link href="/dashboard/customer/cart" className="relative group p-2">
                  <ShoppingCart className="h-6 w-6 text-gray-600 group-hover:text-[#E8207E] transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8207E] text-[10px] font-bold text-white ring-2 ring-white transform translate-x-1 -translate-y-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-gray-100 z-[60]">
                 <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-700">Keranjang Belanja ({cartCount})</span>
                    <span className="text-xs font-bold text-[#E8207E]">{formatCurrency(cartTotal)}</span>
                 </div>
                 
                 <div className="max-h-[240px] overflow-y-auto p-1">
                    {safeCartItems.length === 0 ? (
                       <div className="p-6 text-center text-gray-400 text-sm">
                          Keranjang kosong
                       </div>
                    ) : (
                       safeCartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                             <div className="h-10 w-10 bg-white rounded border overflow-hidden flex-shrink-0 relative">
                                <Image 
                                  src={item.product_variants?.products?.image_url || '/img/placeholder.png'}
                                  alt="Produk"
                                  fill
                                  className="object-cover"
                                />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 line-clamp-1">
                                   {item.product_variants?.products?.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                   {item.quantity} x {formatCurrency(item.product_variants?.price || 0)}
                                </p>
                             </div>
                          </div>
                       ))
                    )}
                 </div>

                 {safeCartItems.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-white">
                       <Button asChild className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white h-8 text-xs">
                          <Link href="/dashboard/customer/cart">Lihat Keranjang & Checkout</Link>
                       </Button>
                    </div>
                 )}
              </HoverCardContent>
            </HoverCard>
          )}

          {/* User Menu */}
          {userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-[#E8207E] transition-all p-0 overflow-hidden"
                >
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-gradient-to-br from-[#E8207E] to-purple-600 text-white font-bold text-xs">
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
                  <Link href="/dashboard/customer/history" className="cursor-pointer hover:text-[#E8207E] hover:bg-pink-50">
                     <History className="mr-2 h-4 w-4" />
                     Riwayat Pesanan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/dashboard/customer/cart" className="cursor-pointer hover:text-[#E8207E] hover:bg-pink-50">
                     <ShoppingCart className="mr-2 h-4 w-4" />
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="font-semibold text-gray-600 hover:text-[#E8207E]">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button size="sm" className="bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-semibold rounded-full px-5" asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-6 py-4 border-b text-left">
                  <Link href="/" onClick={() => setIsSheetOpen(false)}>
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
                        placeholder="Cari fitur..." 
                        className="pl-9 h-9 bg-gray-50"
                        value={searchFeature}
                        onChange={(e) => setSearchFeature(e.target.value)}
                     />
                  </div>
                  
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                        pathname === link.href
                          ? 'bg-[#E8207E]/10 text-[#E8207E]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  
                  <Link
                      href="/dashboard/customer/cart"
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                        pathname === '/dashboard/customer/cart'
                          ? 'bg-[#E8207E]/10 text-[#E8207E]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Keranjang
                      {cartCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#E8207E] text-[10px] font-bold text-white">
                          {cartCount}
                        </span>
                      )}
                  </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
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
                        <Button className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90" asChild>
                          <Link href="/register">Daftar</Link>
                        </Button>
                      </div>
                   )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </nav>
    </header>
  );
}