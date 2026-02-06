import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { messages, context, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "At least one message is required" },
        { status: 400 }
      );
    }

    // Build context from user's recent data (if no explicit context provided)
    let enrichedContext = context;
    if (!enrichedContext) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get the user (first user for personal app)
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const userId = usersData?.users?.[0]?.id;

        if (userId) {
          // Fetch recent meetings (last 5)
          const { data: meetings } = await supabaseAdmin
            .from('meetings')
            .select('title, summary, action_items, decisions, key_topics, date')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

          // Fetch open tasks
          const { data: tasks } = await supabaseAdmin
            .from('tasks')
            .select('title, description, status, priority, due_date')
            .eq('user_id', userId)
            .neq('status', 'done')
            .order('created_at', { ascending: false })
            .limit(10);

          // Fetch recent documents
          const { data: documents } = await supabaseAdmin
            .from('documents')
            .select('title, content, tags')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

          const parts: string[] = [];

          if (meetings?.length) {
            parts.push(
              'RECENT MEETINGS:\n' +
                meetings
                  .map(
                    (m) =>
                      `- ${m.title} (${new Date(m.date).toLocaleDateString()}): ${m.summary?.substring(0, 200)}...`
                  )
                  .join('\n')
            );
          }

          if (tasks?.length) {
            parts.push(
              'OPEN TASKS:\n' +
                tasks
                  .map(
                    (t) =>
                      `- [${t.priority}] ${t.title} (${t.status})${t.due_date ? ` due: ${t.due_date}` : ''}`
                  )
                  .join('\n')
            );
          }

          if (documents?.length) {
            parts.push(
              'DOCUMENTS:\n' +
                documents
                  .map((d) => `- ${d.title}: ${d.content?.substring(0, 300)}...`)
                  .join('\n')
            );
          }

          if (parts.length > 0) {
            enrichedContext = parts.join('\n\n');
          }
        }
      } catch (e) {
        console.error('Failed to fetch context:', e);
        // Continue without context — chat still works
      }
    }

    const response = await chat(messages, enrichedContext, model);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Claude" },
      { status: 500 }
    );
  }
}
