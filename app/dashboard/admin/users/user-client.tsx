'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { UserWithMetadata } from './page';
import { UserTable } from './user-table';
import { UserFormDialog } from './user-form-dialog';
import { deleteUser, toggleUserStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserClientProps {
  initialUsers: UserWithMetadata[];
}

export function UserClient({ initialUsers }: UserClientProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithMetadata | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithMetadata | null>(null);

  const handleEdit = (user: UserWithMetadata) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: UserWithMetadata) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const res = await deleteUser(userToDelete.id);
    toast({
      title: res.success ? 'Berhasil' : 'Gagal',
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    });
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user: UserWithMetadata) => {
    const res = await toggleUserStatus(user.id, !user.is_banned);
    toast({
      title: res.success ? 'Berhasil' : 'Gagal',
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    });
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-600" />
            Manajemen User
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola akun pelanggan dan administrator.
          </p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200/50 rounded-full px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      <UserTable 
        users={initialUsers}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
      />

      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onFormSubmit={() => setIsFormOpen(false)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus user <strong>{userToDelete?.full_name}</strong> secara permanen. Data yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}