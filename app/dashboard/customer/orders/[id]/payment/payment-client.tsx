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
import { UploadCloud, CreditCard, Banknote, Wallet, MapPin, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-bold py-6 rounded-xl shadow-md transition-all text-base" 
      size="lg" 
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
        </span>
      ) : 'Bayar Sekarang'}
    </Button>
  );
}

interface PaymentClientProps {
  orderId: string;
  amount: number;
  initialData?: {
    no_telpon?: string | null;
    address_street?: string | null;
    address_city?: string | null;
    address_province?: string | null;
    address_postal_code?: string | null;
  } | null;
}

export function PaymentClient({ orderId, amount, initialData }: PaymentClientProps) {
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
    // Menggunakan flex-col gap-6 agar hidden inputs tidak menyebabkan margin collapse issue
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="amount" value={amount} />

      {/* --- CARD 1: ALAMAT & KONTAK PENGIRIMAN --- */}
      <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
            <MapPin className="h-4 w-4 text-cyan-600" />
            Informasi Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid gap-5">
          
          <div className="space-y-2">
             <Label htmlFor="phone" className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Nomor Telepon Penerima</Label>
             <Input 
                id="phone" 
                name="phone" 
                placeholder="Contoh: 08123456789" 
                defaultValue={initialData?.no_telpon || ''}
                required 
                className="focus-visible:ring-cyan-500 border-gray-200 h-11 rounded-xl bg-white"
             />
             {state.errors?.phone && <p className="text-xs text-red-500 mt-1">{state.errors.phone[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street" className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Alamat Lengkap</Label>
            <Textarea 
              id="street" 
              name="street" 
              placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan" 
              defaultValue={initialData?.address_street || ''}
              required 
              className="min-h-[80px] resize-none focus-visible:ring-cyan-500 border-gray-200 rounded-xl bg-white p-3"
            />
            {state.errors?.street && <p className="text-xs text-red-500 mt-1">{state.errors.street[0]}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Kota/Kab</Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="Cth: Jakarta Selatan" 
                defaultValue={initialData?.address_city || ''}
                required 
                className="focus-visible:ring-cyan-500 border-gray-200 h-11 rounded-xl bg-white"
              />
              {state.errors?.city && <p className="text-xs text-red-500 mt-1">{state.errors.city[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="province" className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Provinsi</Label>
              <Input 
                id="province" 
                name="province" 
                placeholder="Cth: DKI Jakarta" 
                defaultValue={initialData?.address_province || ''}
                required 
                className="focus-visible:ring-cyan-500 border-gray-200 h-11 rounded-xl bg-white"
              />
              {state.errors?.province && <p className="text-xs text-red-500 mt-1">{state.errors.province[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code" className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Kode Pos</Label>
              <Input 
                id="postal_code" 
                name="postal_code" 
                placeholder="Cth: 12345" 
                defaultValue={initialData?.address_postal_code || ''}
                required 
                className="focus-visible:ring-cyan-500 border-gray-200 h-11 rounded-xl bg-white"
              />
               {state.errors?.postal_code && <p className="text-xs text-red-500 mt-1">{state.errors.postal_code[0]}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- CARD 2: METODE PEMBAYARAN --- */}
      <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
            <Wallet className="h-4 w-4 text-cyan-600" />
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          <RadioGroup 
            name="method" 
            defaultValue="bank_transfer" 
            onValueChange={setMethod}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <PaymentOption 
              id="bank_transfer" 
              value="bank_transfer" 
              icon={<CreditCard className="h-6 w-6 mb-2" />} 
              label="Transfer Bank" 
              description="BCA, Mandiri"
              selectedValue={method}
            />
            <PaymentOption 
              id="e_wallet" 
              value="e_wallet" 
              icon={<Smartphone className="h-6 w-6 mb-2" />} 
              label="E-Wallet" 
              description="GoPay, OVO, Shopee"
              selectedValue={method}
            />
            <PaymentOption 
              id="cod" 
              value="cod" 
              icon={<Banknote className="h-6 w-6 mb-2" />} 
              label="COD" 
              description="Bayar ditempat"
              selectedValue={method}
            />
          </RadioGroup>

          {/* Detail Pembayaran */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            {method === 'bank_transfer' && (
               <div className="text-sm space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <p className="font-semibold text-gray-800">Instruksi Transfer:</p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                       <span className="font-medium text-gray-600">BCA</span>
                       <span className="font-mono font-bold text-lg text-gray-900">123-456-7890</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                       <span className="font-medium text-gray-600">Mandiri</span>
                       <span className="font-mono font-bold text-lg text-gray-900">098-765-4321</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Harap transfer sesuai nominal tagihan (a.n Mutiara Bangsa).
                  </p>
               </div>
            )}

            {/* UPDATE: E-Wallet sekarang menampilkan nomor untuk top-up */}
            {method === 'e_wallet' && (
               <div className="text-sm space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <p className="font-semibold text-gray-800">Nomor E-Wallet (Top-up):</p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                       <span className="font-medium text-gray-600">GoPay</span>
                       <span className="font-mono font-bold text-lg text-gray-900">0812-3456-7890</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                       <span className="font-medium text-gray-600">OVO</span>
                       <span className="font-mono font-bold text-lg text-gray-900">0812-3456-7890</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                       <span className="font-medium text-gray-600">ShopeePay</span>
                       <span className="font-mono font-bold text-lg text-gray-900">0812-3456-7890</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Transfer sesuai nominal, lalu upload bukti transfer.
                  </p>
               </div>
            )}

            {method === 'cod' && (
               <div className="text-sm text-green-700 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p>Pesanan akan diproses langsung. Siapkan uang tunai pas saat kurir datang.</p>
               </div>
            )}
          </div>

          {/* Upload Bukti */}
          {method !== 'cod' && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
              <Label htmlFor="payment_proof" className="text-sm font-semibold text-gray-700">Unggah Bukti Transfer</Label>
              <div className="relative group">
                <div className={cn(
                    "border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[140px] cursor-pointer",
                    // Border dan BG saat aktif kembali ke Cyan
                    previewUrl ? "border-cyan-500 bg-cyan-50/30" : "hover:bg-gray-50 hover:border-gray-400"
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
                        <img src={previewUrl} alt="Preview" className="h-32 object-contain rounded-lg shadow-sm mb-2" />
                        {/* Badge File Terpilih Cyan */}
                        <p className="text-xs text-cyan-600 font-bold flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                           <CheckCircle2 className="h-3 w-3" /> File terpilih
                        </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-500">
                      <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-gray-200 transition-colors">
                         <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Klik untuk pilih gambar</p>
                      <p className="text-xs mt-1">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!state.success && state.message && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
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
    const isSelected = selectedValue === value;
    return (
        <div className="relative">
            <RadioGroupItem value={value} id={id} className="peer sr-only" />
            <Label
                htmlFor={id}
                className={cn(
                    "flex flex-col items-center justify-center text-center p-4 rounded-xl border-2 cursor-pointer transition-all h-full hover:bg-gray-50",
                    // Border selection kembali ke Cyan
                    isSelected 
                        ? "border-cyan-500 bg-cyan-50/50 shadow-sm" 
                        : "border-gray-100 bg-white text-gray-500"
                )}
            >
                {/* Icon mengikuti state selection (Cyan jika aktif) */}
                <div className={cn("mb-1", isSelected ? "text-cyan-600" : "text-gray-400")}>
                   {icon}
                </div>
                <span className={cn("font-bold text-sm mt-1", isSelected ? "text-cyan-700" : "text-gray-700")}>
                    {label}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 leading-tight">{description}</span>
                
                {isSelected && (
                   <div className="absolute top-2 right-2 text-cyan-600">
                      <CheckCircle2 className="h-4 w-4 fill-white" />
                   </div>
                )}
            </Label>
        </div>
    );
}