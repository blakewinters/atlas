import { NextRequest, NextResponse } from "next/server";
import { processMeetingTranscript } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { transcript, date } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required and must be a string" },
        { status: 400 }
      );
    }

    if (transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Transcript cannot be empty" },
        { status: 400 }
      );
    }

    const processed = await processMeetingTranscript(transcript);

    return NextResponse.json({
      ...processed,
      date: date || new Date().toISOString(),
      raw_transcript: transcript,
    });
  } catch (error) {
    console.error("Process meeting error:", error);
    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}
