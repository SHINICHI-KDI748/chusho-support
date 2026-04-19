import { NextResponse } from "next/server";
import { exportCsv } from "@/lib/db";

export async function GET() {
  const csv = exportCsv();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="poc-list-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
