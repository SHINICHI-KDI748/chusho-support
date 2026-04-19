import { NextRequest, NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/db";

export async function GET() {
  const projects = listProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = createProject({
    title: body.title || "新規PoC",
    company_name: body.company_name || "",
    department: body.department || "",
    target_workflow: body.target_workflow || "",
    related_apps: body.related_apps || "",
    start_date: body.start_date || "",
    end_date: body.end_date || "",
    user_count: Number(body.user_count) || 0,
    status: body.status || "ヒアリング中",
    price_estimate: body.price_estimate || "",
    target_industry: body.target_industry || "",
  });
  return NextResponse.json(project, { status: 201 });
}
