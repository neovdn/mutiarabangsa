'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { upsertUser, UserFormState } from './actions';
import { UserWithMetadata } from './page';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithMetadata | null;
  onFormSubmit: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Simpan'}
    </Button>
  );
}

export function UserFormDialog({
  isOpen,
  onOpenChange,
  user,
  onFormSubmit,
}: UserFormDialogProps) {
  const { toast } = useToast();
  const initialState: UserFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(upsertUser, initialState);
  const onFormSubmitRef = useRef(onFormSubmit);

  useEffect(() => {
    onFormSubmitRef.current = onFormSubmit;
  }, [onFormSubmit]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onFormSubmitRef.current();
      }
    }
  }, [state, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Tambah User Baru'}
          </DialogTitle>
          <DialogDescription>
            Isi data lengkap user. Password wajib diisi untuk user baru.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {user && <input type="hidden" name="id" value={user.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={user?.full_name || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user?.role || 'customer'}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ''}
              required
            />
          </div>

          <div className="space-y-2">
             <Label htmlFor="password">Password {user && '(Kosongkan jika tidak ingin mengubah)'}</Label>
             <Input
                id="password"
                name="password"
                type="password"
                placeholder={user ? '******' : 'Minimal 6 karakter'}
                required={!user} // Wajib jika user baru
             />
          </div>

          <div className="space-y-2">
            <Label htmlFor="no_telpon">No. Telepon</Label>
            <Input
              id="no_telpon"
              name="no_telpon"
              defaultValue={user?.no_telpon || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_street">Alamat Jalan</Label>
            <Input
              id="address_street"
              name="address_street"
              defaultValue={user?.address_street || ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="address_city">Kota</Label>
                <Input
                  id="address_city"
                  name="address_city"
                  defaultValue={user?.address_city || ''}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="address_province">Provinsi</Label>
                <Input
                  id="address_province"
                  name="address_province"
                  defaultValue={user?.address_province || ''}
                />
             </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}