import { NextRequest, NextResponse } from "next/server";
import {
  getFullPoc,
  updateProject,
  upsertMetrics,
  upsertComments,
  deleteProject,
} from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const poc = getFullPoc(Number(id));
  if (!poc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const pocId = Number(id);
  const body = await req.json();

  if (body.project) {
    updateProject(pocId, body.project);
  }
  if (body.metrics) {
    upsertMetrics(pocId, body.metrics);
  }
  if (body.comments) {
    upsertComments(pocId, body.comments);
  }

  const poc = getFullPoc(pocId);
  if (!poc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  deleteProject(Number(id));
  return NextResponse.json({ ok: true });
}
