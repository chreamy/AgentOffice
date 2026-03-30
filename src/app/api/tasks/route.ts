export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Task } from "@/lib/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignee = searchParams.get("assignee");

    const filter: Record<string, string> = {};
    if (status && status !== "all") filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, tasks });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const task = await Task.create(body);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
