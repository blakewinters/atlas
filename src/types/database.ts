export type Database = {
  public: {
    Tables: {
      meetings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          raw_transcript: string;
          summary: string | null;
          action_items: Array<{
            task: string;
            assignee: string;
            due: string | null;
          }> | null;
          decisions: Array<{
            decision: string;
            context: string;
          }> | null;
          key_topics: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          raw_transcript: string;
          summary?: string | null;
          action_items?: Array<{
            task: string;
            assignee: string;
            due: string | null;
          }> | null;
          decisions?: Array<{
            decision: string;
            context: string;
          }> | null;
          key_topics?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          raw_transcript?: string;
          summary?: string | null;
          action_items?: Array<{
            task: string;
            assignee: string;
            due: string | null;
          }> | null;
          decisions?: Array<{
            decision: string;
            context: string;
          }> | null;
          key_topics?: string[] | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          meeting_id: string | null;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "done";
          priority: "low" | "medium" | "high";
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meeting_id?: string | null;
          title: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meeting_id?: string | null;
          title?: string;
          description?: string | null;
          status?: "todo" | "in_progress" | "done";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
