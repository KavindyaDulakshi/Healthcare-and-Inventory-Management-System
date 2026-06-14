import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const bills = await dbService.getBills();

    const totalPaid = bills
      .filter((b: any) => b.payment_status.toLowerCase() === "paid")
      .reduce((acc: number, curr: any) => acc + Number(curr.total), 0);

    const totalUnpaid = bills
      .filter((b: any) => b.payment_status.toLowerCase() === "unpaid")
      .reduce((acc: number, curr: any) => acc + Number(curr.total), 0);

    const totalOverdue = bills
      .filter((b: any) => b.payment_status.toLowerCase() === "overdue")
      .reduce((acc: number, curr: any) => acc + Number(curr.total), 0);

    // Monthly aggregation
    const monthlySplits = bills.reduce((acc: Record<string, number>, curr: any) => {
      const date = new Date(curr.created_at);
      const month = date.toLocaleString("default", { month: "short" });
      if (curr.payment_status.toLowerCase() === "paid") {
        acc[month] = (acc[month] || 0) + Number(curr.total);
      }
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        total_paid_revenue: totalPaid,
        total_unpaid_balance: totalUnpaid,
        total_overdue_balance: totalOverdue,
        total_receivable: totalUnpaid + totalOverdue,
        monthly_revenue_history: monthlySplits
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
