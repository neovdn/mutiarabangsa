import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { variantId, quantity, startDate, endDate } = body;

    if (!variantId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert ke tabel forecast_recommendations sesuai skema
    const { data, error } = await supabase
      .from('forecast_recommendations')
      .insert({
        variant_id: variantId,
        recommended_restock_quantity: quantity,
        forecast_period_start: startDate,
        forecast_period_end: endDate,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Save Forecast Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}