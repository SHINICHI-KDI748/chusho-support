import { NextRequest, NextResponse } from "next/server";
import { getFullPoc } from "@/lib/db";
import { generateCaseSheet, generatePlainText } from "@/lib/templates/case-sheet";
import { generateSalesCopies } from "@/lib/templates/sales-copy";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const poc = getFullPoc(Number(id));
  if (!poc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const format = req.nextUrl.searchParams.get("format") ?? "json";

  if (format === "markdown") {
    const md = generateCaseSheet(poc);
    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="case-${id}.md"`,
      },
    });
  }

  if (format === "plain") {
    const text = generatePlainText(poc);
    return new NextResponse(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const caseSheet = generateCaseSheet(poc);
  const salesCopies = generateSalesCopies(poc);
  return NextResponse.json({ caseSheet, salesCopies });
}
