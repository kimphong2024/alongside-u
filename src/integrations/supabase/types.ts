export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bucket_items: {
        Row: {
          category: string
          created_at: string
          done: boolean
          id: string
          owner_id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          done?: boolean
          id?: string
          owner_id: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          done?: boolean
          id?: string
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          created_at: string
          date: string
          id: string
          mood: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          mood: string
          owner_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          mood?: string
          owner_id?: string
        }
        Relationships: []
      }
      checked_items: {
        Row: {
          checked_at: string
          id: string
          item_key: string
          owner_id: string
        }
        Insert: {
          checked_at?: string
          id?: string
          item_key: string
          owner_id: string
        }
        Update: {
          checked_at?: string
          id?: string
          item_key?: string
          owner_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          action_steps: Json
          audio: string | null
          audio_duration: number | null
          audio_mime: string | null
          created_at: string
          date: string
          id: string
          owner_id: string
          status: string
          summary: string | null
          title: string
          transcript: string | null
        }
        Insert: {
          action_steps?: Json
          audio?: string | null
          audio_duration?: number | null
          audio_mime?: string | null
          created_at?: string
          date: string
          id?: string
          owner_id: string
          status?: string
          summary?: string | null
          title?: string
          transcript?: string | null
        }
        Update: {
          action_steps?: Json
          audio?: string | null
          audio_duration?: number | null
          audio_mime?: string | null
          created_at?: string
          date?: string
          id?: string
          owner_id?: string
          status?: string
          summary?: string | null
          title?: string
          transcript?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          owner_id: string
          relationship: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          owner_id: string
          relationship?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          relationship?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          created_at: string
          date: string
          file: string | null
          id: string
          kind: string
          mime: string | null
          note: string
          owner_id: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          file?: string | null
          id?: string
          kind?: string
          mime?: string | null
          note?: string
          owner_id: string
          title?: string
        }
        Update: {
          created_at?: string
          date?: string
          file?: string | null
          id?: string
          kind?: string
          mime?: string | null
          note?: string
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      moments: {
        Row: {
          audio: string | null
          audio_duration: number | null
          created_at: string
          date: string
          id: string
          note: string
          owner_id: string
          photo: string | null
          title: string
          video: string | null
        }
        Insert: {
          audio?: string | null
          audio_duration?: number | null
          created_at?: string
          date: string
          id?: string
          note?: string
          owner_id: string
          photo?: string | null
          title?: string
          video?: string | null
        }
        Update: {
          audio?: string | null
          audio_duration?: number | null
          created_at?: string
          date?: string
          id?: string
          note?: string
          owner_id?: string
          photo?: string | null
          title?: string
          video?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          caregiver_name: string | null
          communication: string | null
          completed: boolean | null
          created_at: string | null
          diagnosed_date: string | null
          emotional: string | null
          family_helps: string | null
          id: string
          illness_stage: string | null
          illness_type: string | null
          is_primary: string | null
          language: string | null
          lovee_name: string | null
          mobility: string | null
          patient_knows: string | null
          priorities: Json | null
          prognosis: string | null
          relationship: string | null
          share_token: string | null
          situation: Json | null
          updated_at: string | null
        }
        Insert: {
          caregiver_name?: string | null
          communication?: string | null
          completed?: boolean | null
          created_at?: string | null
          diagnosed_date?: string | null
          emotional?: string | null
          family_helps?: string | null
          id: string
          illness_stage?: string | null
          illness_type?: string | null
          is_primary?: string | null
          language?: string | null
          lovee_name?: string | null
          mobility?: string | null
          patient_knows?: string | null
          priorities?: Json | null
          prognosis?: string | null
          relationship?: string | null
          share_token?: string | null
          situation?: Json | null
          updated_at?: string | null
        }
        Update: {
          caregiver_name?: string | null
          communication?: string | null
          completed?: boolean | null
          created_at?: string | null
          diagnosed_date?: string | null
          emotional?: string | null
          family_helps?: string | null
          id?: string
          illness_stage?: string | null
          illness_type?: string | null
          is_primary?: string | null
          language?: string | null
          lovee_name?: string | null
          mobility?: string | null
          patient_knows?: string | null
          priorities?: Json | null
          prognosis?: string | null
          relationship?: string | null
          share_token?: string | null
          situation?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
