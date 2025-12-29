'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2, Shield, User, Ban, CheckCircle2 } from 'lucide-react';
import { UserWithMetadata } from './page';

interface UserTableProps {
  users: UserWithMetadata[];
  onEdit: (user: UserWithMetadata) => void;
  onDelete: (user: UserWithMetadata) => void;
  onToggleStatus: (user: UserWithMetadata) => void;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserTableProps) {
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-600">Nama Lengkap</TableHead>
            <TableHead className="font-semibold text-gray-600">Email</TableHead>
            <TableHead className="font-semibold text-gray-600">Role</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="font-semibold text-gray-600">No. Telepon</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-16">
                Tidak ada data user.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-blue-50/30 transition-colors border-gray-100">
                <TableCell className="font-medium text-gray-900">{user.full_name}</TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className={user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-700'}
                  >
                    {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1"/> : <User className="w-3 h-3 mr-1"/>}
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_banned ? (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 shadow-none">Nonaktif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Aktif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {user.no_telpon || '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4 text-gray-500" /> Edit Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(user)} className="cursor-pointer">
                        {user.is_banned ? (
                           <><CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Aktifkan User</>
                        ) : (
                           <><Ban className="mr-2 h-4 w-4 text-orange-600" /> Nonaktifkan</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}