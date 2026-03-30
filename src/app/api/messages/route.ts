import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/lib/models";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "general";
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await Message.find({ channel })
      .sort({ createdAt: 1 })
      .limit(limit);

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const message = await Message.create(body);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
