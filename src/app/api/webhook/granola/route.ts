import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This uses the service role key to bypass RLS since webhooks aren't authenticated as a user
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Granola sends: title, transcript, date, participants, etc.
    // Normalize the data
    const transcript = body.transcript || body.notes || body.content || '';
    const title = body.title || 'Untitled Meeting';
    const date = body.date || body.created_at || new Date().toISOString();

    // Process with Claude to extract structured data
    const { processMeetingTranscript } = await import('@/lib/claude');
    const processed = await processMeetingTranscript(transcript);

    // Get the default user (Blake) — for a personal app, use the first user
    // In production, you'd match by email or use a proper auth flow
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const userId = users?.users?.[0]?.id;

    if (!userId) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    // Save to database
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .insert({
        user_id: userId,
        title: processed.title || title,
        date,
        raw_transcript: transcript,
        summary: processed.summary,
        action_items: processed.action_items,
        decisions: processed.decisions,
        key_topics: processed.key_topics,
      })
      .select()
      .single();

    if (meetingError) {
      console.error('Meeting save error:', meetingError);
      return NextResponse.json({ error: 'Failed to save meeting' }, { status: 500 });
    }

    // Auto-create tasks from action items
    if (processed.action_items?.length > 0) {
      const tasks = processed.action_items.map((item: any) => ({
        user_id: userId,
        meeting_id: meeting.id,
        title: item.task,
        description: `Assignee: ${item.assignee || 'Unassigned'}`,
        status: 'todo',
        priority: 'medium',
        due_date: item.due || null,
      }));

      await supabaseAdmin.from('tasks').insert(tasks);
    }

    return NextResponse.json({
      success: true,
      meeting_id: meeting.id,
      title: processed.title,
      action_items_count: processed.action_items?.length || 0,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
