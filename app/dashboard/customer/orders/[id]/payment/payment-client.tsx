'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitPayment, PaymentFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UploadCloud, CreditCard, Banknote, Wallet, MapPin, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-6" size="lg" disabled={pending}>
      {pending ? 'Menyimpan & Memproses...' : 'Bayar Sekarang'}
    </Button>
  );
}

interface PaymentClientProps {
  orderId: string;
  amount: number;
  initialAddress?: {
    address_street?: string | null;
    address_city?: string | null;
    address_province?: string | null;
    address_postal_code?: string | null;
  } | null;
}

export function PaymentClient({ orderId, amount, initialAddress }: PaymentClientProps) {
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
    <form action={formAction} className="space-y-6">
      {/* Hidden Inputs untuk ID dan Amount */}
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="amount" value={amount} />

      {/* --- CARD 1: ALAMAT PENGIRIMAN --- */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-gray-50/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
            <MapPin className="h-4 w-4 text-cyan-600" />
            Alamat Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-xs text-gray-500 uppercase tracking-wide">Alamat Lengkap</Label>
            <Textarea 
              id="street" 
              name="street" 
              placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan" 
              defaultValue={initialAddress?.address_street || ''}
              required 
              className="min-h-[80px] resize-none focus-visible:ring-cyan-500"
            />
            {state.errors?.street && <p className="text-xs text-red-500 mt-1">{state.errors.street[0]}</p>}
          </div>
          
          {/* Grid 3 Kolom agar compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs text-gray-500 uppercase tracking-wide">Kota/Kab</Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="Cth: Jakarta Selatan" 
                defaultValue={initialAddress?.address_city || ''}
                required 
              />
              {state.errors?.city && <p className="text-xs text-red-500 mt-1">{state.errors.city[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province" className="text-xs text-gray-500 uppercase tracking-wide">Provinsi</Label>
              <Input 
                id="province" 
                name="province" 
                placeholder="Cth: DKI Jakarta" 
                defaultValue={initialAddress?.address_province || ''}
                required 
              />
              {state.errors?.province && <p className="text-xs text-red-500 mt-1">{state.errors.province[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postal_code" className="text-xs text-gray-500 uppercase tracking-wide">Kode Pos</Label>
              <Input 
                id="postal_code" 
                name="postal_code" 
                placeholder="Cth: 12345" 
                defaultValue={initialAddress?.address_postal_code || ''}
                required 
              />
               {state.errors?.postal_code && <p className="text-xs text-red-500 mt-1">{state.errors.postal_code[0]}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- CARD 2: METODE PEMBAYARAN --- */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-gray-50/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
            <Wallet className="h-4 w-4 text-cyan-600" />
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          
          <RadioGroup 
            name="method" 
            defaultValue="bank_transfer" 
            onValueChange={setMethod}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <PaymentOption 
              id="bank_transfer" 
              value="bank_transfer" 
              icon={<CreditCard className="h-6 w-6 mb-2 text-cyan-600" />} 
              label="Transfer Bank" 
              description="BCA, Mandiri, BRI"
              selectedValue={method}
            />
            <PaymentOption 
              id="e_wallet" 
              value="e_wallet" 
              icon={<Wallet className="h-6 w-6 mb-2 text-purple-600" />} 
              label="E-Wallet" 
              description="QRIS, GoPay, OVO"
              selectedValue={method}
            />
            <PaymentOption 
              id="cod" 
              value="cod" 
              icon={<Banknote className="h-6 w-6 mb-2 text-green-600" />} 
              label="COD" 
              description="Bayar ditempat"
              selectedValue={method}
            />
          </RadioGroup>

          {/* Detail Pembayaran */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            {method === 'bank_transfer' && (
               <div className="text-sm space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <p className="font-semibold text-gray-700">Instruksi Transfer:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-1">
                    <li>Bank BCA: <span className="font-mono font-medium text-black">123-456-7890</span> (a.n Mutiara Bangsa)</li>
                    <li>Bank Mandiri: <span className="font-mono font-medium text-black">098-765-4321</span> (a.n Mutiara Bangsa)</li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2">*Harap transfer sesuai nominal tagihan.</p>
               </div>
            )}
            {method === 'e_wallet' && (
               <div className="text-sm text-gray-600 animate-in fade-in zoom-in-95 duration-300 text-center py-2">
                  <p>Silakan scan QRIS atau transfer ke nomor E-Wallet Admin setelah melakukan konfirmasi.</p>
               </div>
            )}
            {method === 'cod' && (
               <div className="text-sm text-green-700 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300 bg-green-50 p-2 rounded">
                  <CheckCircle2 className="h-4 w-4" />
                  Pesanan akan diproses. Siapkan uang tunai saat kurir datang.
               </div>
            )}
          </div>

          {/* Upload Bukti (Conditional) */}
          {method !== 'cod' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <Label htmlFor="payment_proof" className="text-sm font-medium">Unggah Bukti Transfer</Label>
              <div className="relative group">
                <div className={cn(
                    "border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all min-h-[120px]",
                    previewUrl ? "border-cyan-400 bg-cyan-50/30" : "hover:bg-gray-50 hover:border-gray-400"
                )}>
                  <input 
                    type="file" 
                    id="payment_proof" 
                    name="payment_proof"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required={method !== 'cod'}
                  />
                  {previewUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-24 object-contain rounded shadow-sm" />
                        <p className="text-xs text-cyan-700 mt-2 font-medium flex items-center gap-1">
                           <CheckCircle2 className="h-3 w-3" /> File terpilih
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">(Klik untuk ganti)</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-500">
                      <UploadCloud className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Klik untuk pilih gambar</p>
                      <p className="text-xs mt-1">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {!state.success && state.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </CardContent>
      </Card>
    </form>
  );
}

function PaymentOption({ id, value, icon, label, description, selectedValue }: any) {
    return (
        <div className="relative">
            <RadioGroupItem value={value} id={id} className="peer sr-only" />
            <Label
                htmlFor={id}
                className={cn(
                    "flex flex-col items-center justify-center text-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50",
                    selectedValue === value 
                        ? "border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600" 
                        : "border-muted bg-white text-gray-500"
                )}
            >
                {icon}
                <span className={cn("font-semibold text-sm", selectedValue === value ? "text-cyan-900" : "text-gray-700")}>
                    {label}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">{description}</span>
            </Label>
        </div>
    );
}