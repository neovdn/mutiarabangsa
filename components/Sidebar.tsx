'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image'; // <-- TAMBAHKAN IMPORT INI
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userName: string;
  menuItems: {
    label: string;
    icon: React.ReactNode;
    href?: string;
    active?: boolean;
  }[];
}

export default function Sidebar({ userName, menuItems }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* UBAH DIV HEADER INI */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <Image
          src="/img/MUTIARABANGSA.png"
          alt="Mutiara Bangsa Logo"
          width={100}
          height={34}
        />
        <span className="text-lg font-medium text-gray-700 truncate">
          {userName}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.href && router.push(item.href)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              item.active
                ? 'bg-cyan text-primary-foreground font-medium' // <-- UBAH DARI bg-cyan
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </Button>
      </div>
    </aside>
  );
}