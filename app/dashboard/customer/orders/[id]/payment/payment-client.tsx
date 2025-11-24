'use client';

import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitPayment, PaymentFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UploadCloud, CreditCard, Banknote, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Mengirim...' : 'Konfirmasi Pembayaran'}
    </Button>
  );
}

interface PaymentClientProps {
  orderId: string;
  amount: number;
}

export function PaymentClient({ orderId, amount }: PaymentClientProps) {
  const [method, setMethod] = useState('bank_transfer');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const initialState: PaymentFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(submitPayment, initialState);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="amount" value={amount} />

          {/* Pilihan Metode */}
          <RadioGroup 
            name="method" 
            defaultValue="bank_transfer" 
            onValueChange={setMethod}
            className="grid grid-cols-1 gap-4"
          >
            <div className="relative">
              <RadioGroupItem value="bank_transfer" id="transfer" className="peer sr-only" />
              <Label
                htmlFor="transfer"
                className="flex items-center gap-4 rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              >
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold">Transfer Bank</p>
                  <p className="text-xs text-muted-foreground">BCA, Mandiri, BRI</p>
                </div>
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem value="e_wallet" id="ewallet" className="peer sr-only" />
              <Label
                htmlFor="ewallet"
                className="flex items-center gap-4 rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              >
                <Wallet className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold">E-Wallet</p>
                  <p className="text-xs text-muted-foreground">GoPay, OVO, Dana</p>
                </div>
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
              <Label
                htmlFor="cod"
                className="flex items-center gap-4 rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              >
                <Banknote className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold">Cash On Delivery (COD)</p>
                  <p className="text-xs text-muted-foreground">Bayar saat barang sampai</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Informasi Rekening (Jika Online) */}
          {method !== 'cod' && (
            <div className="bg-muted/50 p-4 rounded-md text-sm space-y-2 border border-dashed border-gray-300">
              <p className="font-semibold">Silakan transfer ke:</p>
              <ul className="list-disc list-inside text-gray-600">
                <li>BCA: 123-456-7890 (Mutiara Bangsa)</li>
                <li>Mandiri: 098-765-4321 (Mutiara Bangsa)</li>
              </ul>
            </div>
          )}

          {/* Upload Bukti (Jika Online) */}
          {method !== 'cod' && (
            <div className="space-y-2">
              <Label htmlFor="payment_proof">Unggah Bukti Pembayaran</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  id="payment_proof" 
                  name="payment_proof"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview Bukti" className="max-h-48 rounded-md object-contain" />
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Klik untuk unggah gambar</p>
                    <p className="text-xs text-gray-500">JPG, PNG, maksimal 5MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {!state.success && state.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}