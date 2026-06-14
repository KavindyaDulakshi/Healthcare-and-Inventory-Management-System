import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const medicines = await dbService.getMedicines();
    
    const totalRecords = medicines.length;
    const lowStock = medicines.filter((m: any) => m.quantity > 0 && m.quantity < 50).length;
    const outOfStock = medicines.filter((m: any) => m.quantity <= 0).length;
    
    // Check expiry
    const today = new Date("2026-06-09");
    const expired = medicines.filter((m: any) => new Date(m.expiry_date) <= today).length;

    const totalHoldingsValue = medicines.reduce((acc: number, curr: any) => 
      acc + (Number(curr.quantity) * Number(curr.unit_price)), 0
    );

    return NextResponse.json({
      summary: {
        total_records: totalRecords,
        low_stock_records: lowStock,
        out_of_stock_records: outOfStock,
        expired_records: expired,
        total_holdings_value: totalHoldingsValue,
        average_price: totalRecords > 0 ? (totalHoldingsValue / medicines.reduce((s: number, m: any) => s + m.quantity, 0)) : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
