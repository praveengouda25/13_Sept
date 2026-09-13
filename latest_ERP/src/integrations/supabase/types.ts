export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      admissions: {
        Row: {
          applicant_name: string;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          id: string;
          remarks: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["admission_status"];
          student_id: string | null;
          updated_at: string;
        };
        Insert: {
          applicant_name: string;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id?: string;
          remarks?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["admission_status"];
          student_id?: string | null;
          updated_at?: string;
        };
        Update: {
          applicant_name?: string;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          id?: string;
          remarks?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["admission_status"];
          student_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admissions_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_settings: {
        Row: {
          ai_enabled: boolean;
          ai_provider: string;
          ai_widgets_enabled: boolean;
          api_key_encrypted: string | null;
          attendance_prediction_enabled: boolean;
          branch_id: string | null;
          created_at: string;
          created_by: string | null;
          dashboard_insights_enabled: boolean;
          donation_prediction_enabled: boolean;
          id: string;
          inventory_prediction_enabled: boolean;
          maintenance_prediction_enabled: boolean;
          trust_id: string | null;
          updated_at: string;
        };
        Insert: {
          ai_enabled?: boolean;
          ai_provider?: string;
          ai_widgets_enabled?: boolean;
          api_key_encrypted?: string | null;
          attendance_prediction_enabled?: boolean;
          branch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          dashboard_insights_enabled?: boolean;
          donation_prediction_enabled?: boolean;
          id?: string;
          inventory_prediction_enabled?: boolean;
          maintenance_prediction_enabled?: boolean;
          trust_id?: string | null;
          updated_at?: string;
        };
        Update: {
          ai_enabled?: boolean;
          ai_provider?: string;
          ai_widgets_enabled?: boolean;
          api_key_encrypted?: string | null;
          attendance_prediction_enabled?: boolean;
          branch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          dashboard_insights_enabled?: boolean;
          donation_prediction_enabled?: boolean;
          id?: string;
          inventory_prediction_enabled?: boolean;
          maintenance_prediction_enabled?: boolean;
          trust_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_settings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_settings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_settings_trust_id_fkey";
            columns: ["trust_id"];
            isOneToOne: false;
            referencedRelation: "trusts";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          asset_code: string | null;
          branch_id: string;
          category: string | null;
          condition: Database["public"]["Enums"]["asset_condition"];
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          hostel_id: string | null;
          id: string;
          location: string | null;
          name: string;
          notes: string | null;
          purchase_cost: number | null;
          purchase_date: string | null;
          quantity: number;
          room_id: string | null;
          serial_number: string | null;
          updated_at: string;
        };
        Insert: {
          asset_code?: string | null;
          branch_id: string;
          category?: string | null;
          condition?: Database["public"]["Enums"]["asset_condition"];
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          location?: string | null;
          name: string;
          notes?: string | null;
          purchase_cost?: number | null;
          purchase_date?: string | null;
          quantity?: number;
          room_id?: string | null;
          serial_number?: string | null;
          updated_at?: string;
        };
        Update: {
          asset_code?: string | null;
          branch_id?: string;
          category?: string | null;
          condition?: Database["public"]["Enums"]["asset_condition"];
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          location?: string | null;
          name?: string;
          notes?: string | null;
          purchase_cost?: number | null;
          purchase_date?: string | null;
          quantity?: number;
          room_id?: string | null;
          serial_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "assets_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: {
          attendance_date: string;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          hostel_id: string | null;
          id: string;
          marked_by: string | null;
          remarks: string | null;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          attendance_date?: string;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          hostel_id?: string | null;
          id?: string;
          marked_by?: string | null;
          remarks?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          attendance_date?: string;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          hostel_id?: string | null;
          id?: string;
          marked_by?: string | null;
          remarks?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          branch_id: string | null;
          created_at: string;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          record_id: string | null;
          table_name: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          branch_id?: string | null;
          created_at?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string | null;
          table_name: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          branch_id?: string | null;
          created_at?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string | null;
          table_name?: string;
        };
        Relationships: [];
      };
      bed_allocations: {
        Row: {
          allocated_at: string;
          bed_id: string;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          hostel_id: string;
          id: string;
          reason: string | null;
          room_id: string;
          status: Database["public"]["Enums"]["allocation_status"];
          student_id: string;
          updated_at: string;
          vacated_at: string | null;
        };
        Insert: {
          allocated_at?: string;
          bed_id: string;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          hostel_id: string;
          id?: string;
          reason?: string | null;
          room_id: string;
          status?: Database["public"]["Enums"]["allocation_status"];
          student_id: string;
          updated_at?: string;
          vacated_at?: string | null;
        };
        Update: {
          allocated_at?: string;
          bed_id?: string;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          hostel_id?: string;
          id?: string;
          reason?: string | null;
          room_id?: string;
          status?: Database["public"]["Enums"]["allocation_status"];
          student_id?: string;
          updated_at?: string;
          vacated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bed_allocations_bed_id_fkey";
            columns: ["bed_id"];
            isOneToOne: false;
            referencedRelation: "beds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_allocations_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_allocations_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_allocations_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "bed_allocations_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bed_allocations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      beds: {
        Row: {
          bed_number: string;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          hostel_id: string;
          id: string;
          room_id: string;
          status: Database["public"]["Enums"]["bed_status"];
          updated_at: string;
        };
        Insert: {
          bed_number: string;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id: string;
          id?: string;
          room_id: string;
          status?: Database["public"]["Enums"]["bed_status"];
          updated_at?: string;
        };
        Update: {
          bed_number?: string;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id?: string;
          id?: string;
          room_id?: string;
          status?: Database["public"]["Enums"]["bed_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "beds_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "beds_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "beds_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "beds_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          address: string | null;
          alternate_contact: string | null;
          branch_type: Database["public"]["Enums"]["branch_type"] | null;
          city: string | null;
          code: string;
          contact_phone: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          district: string | null;
          email: string | null;
          gst_number: string | null;
          id: string;
          is_active: boolean;
          latitude: number | null;
          logo_url: string | null;
          longitude: number | null;
          name: string;
          phone_country_code: string | null;
          photo_url: string | null;
          pincode: string | null;
          registration_number: string | null;
          state: string | null;
          taluk: string | null;
          trust_id: string;
          updated_at: string;
          village: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          alternate_contact?: string | null;
          branch_type?: Database["public"]["Enums"]["branch_type"] | null;
          city?: string | null;
          code: string;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          district?: string | null;
          email?: string | null;
          gst_number?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          logo_url?: string | null;
          longitude?: number | null;
          name: string;
          phone_country_code?: string | null;
          photo_url?: string | null;
          pincode?: string | null;
          registration_number?: string | null;
          state?: string | null;
          taluk?: string | null;
          trust_id: string;
          updated_at?: string;
          village?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          alternate_contact?: string | null;
          branch_type?: Database["public"]["Enums"]["branch_type"] | null;
          city?: string | null;
          code?: string;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          district?: string | null;
          email?: string | null;
          gst_number?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          logo_url?: string | null;
          longitude?: number | null;
          name?: string;
          phone_country_code?: string | null;
          photo_url?: string | null;
          pincode?: string | null;
          registration_number?: string | null;
          state?: string | null;
          taluk?: string | null;
          trust_id?: string;
          updated_at?: string;
          village?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "branches_trust_id_fkey";
            columns: ["trust_id"];
            isOneToOne: false;
            referencedRelation: "trusts";
            referencedColumns: ["id"];
          },
        ];
      };
      buildings: {
        Row: {
          branch_id: string;
          code: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          floors_count: number;
          hostel_id: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          floors_count?: number;
          hostel_id: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          floors_count?: number;
          hostel_id?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buildings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buildings_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buildings_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
        ];
      };
      complaints: {
        Row: {
          assigned_to: string | null;
          branch_id: string;
          category: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          hostel_id: string | null;
          id: string;
          priority: Database["public"]["Enums"]["issue_priority"];
          reported_on: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          room_id: string | null;
          status: Database["public"]["Enums"]["complaint_status"];
          student_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          branch_id: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          student_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          branch_id?: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["complaint_status"];
          student_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaints_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "complaints_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaints_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      donations: {
        Row: {
          amount: number;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          currency: string;
          deleted_at: string | null;
          donated_on: string;
          donor_email: string | null;
          donor_name: string;
          donor_phone: string | null;
          id: string;
          mode: Database["public"]["Enums"]["payment_mode"];
          notes: string | null;
          purpose: string | null;
          receipt_number: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          deleted_at?: string | null;
          donated_on?: string;
          donor_email?: string | null;
          donor_name: string;
          donor_phone?: string | null;
          id?: string;
          mode?: Database["public"]["Enums"]["payment_mode"];
          notes?: string | null;
          purpose?: string | null;
          receipt_number?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          deleted_at?: string | null;
          donated_on?: string;
          donor_email?: string | null;
          donor_name?: string;
          donor_phone?: string | null;
          id?: string;
          mode?: Database["public"]["Enums"]["payment_mode"];
          notes?: string | null;
          purpose?: string | null;
          receipt_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donations_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      emergency_contacts: {
        Row: {
          branch_id: string;
          contact_type: string;
          created_at: string;
          created_by: string | null;
          id: string;
          label: string;
          notes: string | null;
          phone: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          contact_type?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          label: string;
          notes?: string | null;
          phone: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          contact_type?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          label?: string;
          notes?: string | null;
          phone?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          branch_id: string;
          category: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          mode: Database["public"]["Enums"]["payment_mode"];
          notes: string | null;
          reference_number: string | null;
          spent_on: string;
          updated_at: string;
          vendor: string | null;
        };
        Insert: {
          amount: number;
          branch_id: string;
          category: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          mode?: Database["public"]["Enums"]["payment_mode"];
          notes?: string | null;
          reference_number?: string | null;
          spent_on?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Update: {
          amount?: number;
          branch_id?: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          mode?: Database["public"]["Enums"]["payment_mode"];
          notes?: string | null;
          reference_number?: string | null;
          spent_on?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      floors: {
        Row: {
          branch_id: string;
          building_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          level: number;
          name: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          building_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          level?: number;
          name: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          building_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          level?: number;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "floors_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "floors_building_id_fkey";
            columns: ["building_id"];
            isOneToOne: false;
            referencedRelation: "buildings";
            referencedColumns: ["id"];
          },
        ];
      };
      food_stock: {
        Row: {
          branch_id: string;
          category: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          expiry_date: string | null;
          id: string;
          item_name: string;
          min_quantity: number;
          notes: string | null;
          quantity: number;
          unit: string;
          unit_cost: number | null;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          branch_id: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          expiry_date?: string | null;
          id?: string;
          item_name: string;
          min_quantity?: number;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          unit_cost?: number | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          branch_id?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          expiry_date?: string | null;
          id?: string;
          item_name?: string;
          min_quantity?: number;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          unit_cost?: number | null;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "food_stock_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "food_stock_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      guardians: {
        Row: {
          address: string | null;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string | null;
          full_name: string;
          id: string;
          occupation: string | null;
          phone: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          full_name: string;
          id?: string;
          occupation?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          occupation?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guardians_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      hostels: {
        Row: {
          address: string | null;
          branch_id: string;
          capacity: number;
          code: string;
          contact_person: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          emergency_contact: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          maintenance_status: string;
          name: string;
          rules: string | null;
          type: Database["public"]["Enums"]["hostel_type"];
          updated_at: string;
          warden_id: string | null;
        };
        Insert: {
          address?: string | null;
          branch_id: string;
          capacity?: number;
          code: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          emergency_contact?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          maintenance_status?: string;
          name: string;
          rules?: string | null;
          type?: Database["public"]["Enums"]["hostel_type"];
          updated_at?: string;
          warden_id?: string | null;
        };
        Update: {
          address?: string | null;
          branch_id?: string;
          capacity?: number;
          code?: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          emergency_contact?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          maintenance_status?: string;
          name?: string;
          rules?: string | null;
          type?: Database["public"]["Enums"]["hostel_type"];
          updated_at?: string;
          warden_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hostels_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_items: {
        Row: {
          branch_id: string;
          category: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          hostel_id: string | null;
          id: string;
          location: string | null;
          min_quantity: number;
          name: string;
          notes: string | null;
          quantity: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          location?: string | null;
          min_quantity?: number;
          name: string;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          location?: string | null;
          min_quantity?: number;
          name?: string;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_items_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_items_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_items_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
        ];
      };
      inventory_transactions: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          item_id: string;
          occurred_on: string;
          quantity: number;
          reason: string | null;
          txn_type: Database["public"]["Enums"]["stock_txn_type"];
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          item_id: string;
          occurred_on?: string;
          quantity: number;
          reason?: string | null;
          txn_type: Database["public"]["Enums"]["stock_txn_type"];
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          item_id?: string;
          occurred_on?: string;
          quantity?: number;
          reason?: string | null;
          txn_type?: Database["public"]["Enums"]["stock_txn_type"];
        };
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "inventory_items";
            referencedColumns: ["id"];
          },
        ];
      };
      issues: {
        Row: {
          assigned_to: string | null;
          branch_id: string;
          category: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          hostel_id: string | null;
          id: string;
          priority: Database["public"]["Enums"]["issue_priority"];
          reported_on: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          room_id: string | null;
          status: Database["public"]["Enums"]["issue_status"];
          student_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          branch_id: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["issue_status"];
          student_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          branch_id?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["issue_status"];
          student_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "issues_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "issues_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      leave_requests: {
        Row: {
          branch_id: string;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          destination: string | null;
          from_date: string;
          id: string;
          reason: string;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["leave_status"];
          student_id: string;
          to_date: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          destination?: string | null;
          from_date: string;
          id?: string;
          reason: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["leave_status"];
          student_id: string;
          to_date: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          destination?: string | null;
          from_date?: string;
          id?: string;
          reason?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["leave_status"];
          student_id?: string;
          to_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leave_requests_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      maintenance_requests: {
        Row: {
          asset_id: string | null;
          assigned_to: string | null;
          branch_id: string;
          completed_on: string | null;
          cost: number | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          hostel_id: string | null;
          id: string;
          notes: string | null;
          priority: Database["public"]["Enums"]["issue_priority"];
          reported_on: string;
          request_type: string;
          room_id: string | null;
          status: Database["public"]["Enums"]["maintenance_status"];
          title: string;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          asset_id?: string | null;
          assigned_to?: string | null;
          branch_id: string;
          completed_on?: string | null;
          cost?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          notes?: string | null;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          request_type?: string;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["maintenance_status"];
          title: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          asset_id?: string | null;
          assigned_to?: string | null;
          branch_id?: string;
          completed_on?: string | null;
          cost?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          hostel_id?: string | null;
          id?: string;
          notes?: string | null;
          priority?: Database["public"]["Enums"]["issue_priority"];
          reported_on?: string;
          request_type?: string;
          room_id?: string | null;
          status?: Database["public"]["Enums"]["maintenance_status"];
          title?: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_requests_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_requests_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_requests_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "maintenance_requests_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_requests_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_attendance: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          meal: Database["public"]["Enums"]["meal_type"];
          meal_date: string;
          present: boolean;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          meal: Database["public"]["Enums"]["meal_type"];
          meal_date?: string;
          present?: boolean;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          meal?: Database["public"]["Enums"]["meal_type"];
          meal_date?: string;
          present?: boolean;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_attendance_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      medical_records: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          doctor_name: string | null;
          dosage: string | null;
          hospital: string | null;
          id: string;
          is_critical: boolean;
          medicine: string | null;
          next_due_on: string | null;
          occurred_on: string;
          record_type: Database["public"]["Enums"]["medical_record_type"];
          student_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          doctor_name?: string | null;
          dosage?: string | null;
          hospital?: string | null;
          id?: string;
          is_critical?: boolean;
          medicine?: string | null;
          next_due_on?: string | null;
          occurred_on?: string;
          record_type?: Database["public"]["Enums"]["medical_record_type"];
          student_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          doctor_name?: string | null;
          dosage?: string | null;
          hospital?: string | null;
          id?: string;
          is_critical?: boolean;
          medicine?: string | null;
          next_due_on?: string | null;
          occurred_on?: string;
          record_type?: Database["public"]["Enums"]["medical_record_type"];
          student_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medical_records_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      medicines: {
        Row: {
          branch_id: string;
          category: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          expiry_date: string | null;
          id: string;
          min_quantity: number;
          name: string;
          notes: string | null;
          quantity: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          expiry_date?: string | null;
          id?: string;
          min_quantity?: number;
          name: string;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          expiry_date?: string | null;
          id?: string;
          min_quantity?: number;
          name?: string;
          notes?: string | null;
          quantity?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medicines_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      mess_menus: {
        Row: {
          branch_id: string;
          calories: number | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          id: string;
          items: string;
          meal: Database["public"]["Enums"]["meal_type"];
          menu_date: string;
          notes: string | null;
          protein_g: number | null;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          calories?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          items: string;
          meal: Database["public"]["Enums"]["meal_type"];
          menu_date?: string;
          notes?: string | null;
          protein_g?: number | null;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          calories?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          items?: string;
          meal?: Database["public"]["Enums"]["meal_type"];
          menu_date?: string;
          notes?: string | null;
          protein_g?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mess_menus_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          branch_id: string | null;
          category: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_archived: boolean;
          is_read: boolean;
          link: string | null;
          message: string | null;
          priority: Database["public"]["Enums"]["notification_priority"];
          recipient_id: string | null;
          recipient_role: Database["public"]["Enums"]["app_role"] | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          branch_id?: string | null;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_archived?: boolean;
          is_read?: boolean;
          link?: string | null;
          message?: string | null;
          priority?: Database["public"]["Enums"]["notification_priority"];
          recipient_id?: string | null;
          recipient_role?: Database["public"]["Enums"]["app_role"] | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          branch_id?: string | null;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_archived?: boolean;
          is_read?: boolean;
          link?: string | null;
          message?: string | null;
          priority?: Database["public"]["Enums"]["notification_priority"];
          recipient_id?: string | null;
          recipient_role?: Database["public"]["Enums"]["app_role"] | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          default_branch_id: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          notification_prefs: Json;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          default_branch_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          notification_prefs?: Json;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          default_branch_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          notification_prefs?: Json;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          module: string;
          role: Database["public"]["Enums"]["app_role"];
          scope: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          module: string;
          role: Database["public"]["Enums"]["app_role"];
          scope?: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          module?: string;
          role?: Database["public"]["Enums"]["app_role"];
          scope?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          branch_id: string;
          capacity: number;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          floor_id: string;
          has_ac: boolean;
          has_attached_bathroom: boolean;
          has_cupboard: boolean;
          has_fan: boolean;
          has_study_table: boolean;
          hostel_id: string;
          id: string;
          is_active: boolean;
          notes: string | null;
          room_number: string;
          room_type: string | null;
          updated_at: string;
        };
        Insert: {
          branch_id: string;
          capacity?: number;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          floor_id: string;
          has_ac?: boolean;
          has_attached_bathroom?: boolean;
          has_cupboard?: boolean;
          has_fan?: boolean;
          has_study_table?: boolean;
          hostel_id: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          room_number: string;
          room_type?: string | null;
          updated_at?: string;
        };
        Update: {
          branch_id?: string;
          capacity?: number;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          floor_id?: string;
          has_ac?: boolean;
          has_attached_bathroom?: boolean;
          has_cupboard?: boolean;
          has_fan?: boolean;
          has_study_table?: boolean;
          hostel_id?: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          room_number?: string;
          room_type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_floor_id_fkey";
            columns: ["floor_id"];
            isOneToOne: false;
            referencedRelation: "floors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
        ];
      };
      security_logs: {
        Row: {
          alert_level: string;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          log_type: string;
          occurred_at: string;
          resolved: boolean;
          student_id: string | null;
          title: string;
          updated_at: string;
          visitor_id: string | null;
        };
        Insert: {
          alert_level?: string;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          log_type?: string;
          occurred_at?: string;
          resolved?: boolean;
          student_id?: string | null;
          title: string;
          updated_at?: string;
          visitor_id?: string | null;
        };
        Update: {
          alert_level?: string;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          log_type?: string;
          occurred_at?: string;
          resolved?: boolean;
          student_id?: string | null;
          title?: string;
          updated_at?: string;
          visitor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "security_logs_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "security_logs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "security_logs_visitor_id_fkey";
            columns: ["visitor_id"];
            isOneToOne: false;
            referencedRelation: "visitors";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          department: string | null;
          designation: string | null;
          email: string | null;
          full_name: string;
          id: string;
          joined_on: string | null;
          notes: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["staff_status"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          department?: string | null;
          designation?: string | null;
          email?: string | null;
          full_name: string;
          id?: string;
          joined_on?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["staff_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          department?: string | null;
          designation?: string | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          joined_on?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["staff_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      student_documents: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          doc_type: string;
          file_name: string | null;
          file_path: string;
          id: string;
          is_verified: boolean;
          student_id: string;
          updated_at: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          doc_type: string;
          file_name?: string | null;
          file_path: string;
          id?: string;
          is_verified?: boolean;
          student_id: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          doc_type?: string;
          file_name?: string | null;
          file_path?: string;
          id?: string;
          is_verified?: boolean;
          student_id?: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_documents_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_documents_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_gate_passes: {
        Row: {
          actual_exit_time: string | null;
          actual_return_time: string | null;
          approved_at: string | null;
          approved_by: string | null;
          bed_id: string | null;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          destination: string | null;
          expected_return_time: string | null;
          gate_pass_number: string | null;
          hostel_id: string | null;
          id: string;
          out_time: string;
          purpose: string;
          parent_contact: string | null;
          qr_code: string | null;
          remarks: string | null;
          room_id: string | null;
          security_id: string | null;
        emergency_contact: string | null;
          rejection_reason: string | null;
          rejected_by: string | null;
          rejected_at: string | null;
          marked_exit_by: string | null;
          status: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          actual_exit_time?: string | null;
          actual_return_time?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          bed_id?: string | null;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          destination?: string | null;
          expected_return_time?: string | null;
          gate_pass_number?: string | null;
          hostel_id?: string | null;
          id?: string;
          out_time: string;
          purpose: string;
          parent_contact?: string | null;
          qr_code?: string | null;
          remarks?: string | null;
          room_id?: string | null;
          security_id?: string | null;
        emergency_contact?: string | null;
          rejection_reason?: string | null;
          rejected_by?: string | null;
          rejected_at?: string | null;
          marked_exit_by?: string | null;
          status?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          actual_exit_time?: string | null;
          actual_return_time?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          bed_id?: string | null;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          destination?: string | null;
          expected_return_time?: string | null;
          gate_pass_number?: string | null;
          hostel_id?: string | null;
          id?: string;
          out_time?: string;
          purpose?: string;
          parent_contact?: string | null;
          qr_code?: string | null;
          remarks?: string | null;
          room_id?: string | null;
          security_id?: string | null;
        emergency_contact?: string | null;
          rejection_reason?: string | null;
          rejected_by?: string | null;
          rejected_at?: string | null;
          marked_exit_by?: string | null;
          status?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_gate_passes_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_bed_id_fkey";
            columns: ["bed_id"];
            isOneToOne: false;
            referencedRelation: "beds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "student_gate_passes_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_security_id_fkey";
            columns: ["security_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_gate_passes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_guardians: {
        Row: {
          created_at: string;
          created_by: string | null;
          guardian_id: string;
          id: string;
          is_primary: boolean;
          portal_access: boolean;
          relationship: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          guardian_id: string;
          id?: string;
          is_primary?: boolean;
          portal_access?: boolean;
          relationship?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          guardian_id?: string;
          id?: string;
          is_primary?: boolean;
          portal_access?: boolean;
          relationship?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey";
            columns: ["guardian_id"];
            isOneToOne: false;
            referencedRelation: "guardians";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_guardians_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      student_timeline_events: {
        Row: {
          branch_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          event_type: string;
          id: string;
          metadata: Json | null;
          occurred_at: string;
          student_id: string;
          title: string;
        };
        Insert: {
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          occurred_at?: string;
          student_id: string;
          title: string;
        };
        Update: {
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          occurred_at?: string;
          student_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_timeline_events_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_timeline_events_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          aadhaar_number: string | null;
          address: string | null;
          admission_date: string | null;
          admission_number: string;
          blood_group: string | null;
          branch_id: string;
          caste: string | null;
          category: string | null;
          class_grade: string | null;
          country: string | null;
          created_at: string;
          created_by: string | null;
          custom_village: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          district: string | null;
          email: string | null;
          father_aadhaar: string | null;
          father_mobile: string | null;
          father_name: string | null;
          father_occupation: string | null;
          father_pan: string | null;
          first_name: string;
          gender: Database["public"]["Enums"]["gender_type"] | null;
          guardian_mobile: string | null;
          guardian_name: string | null;
          guardian_relationship: string | null;
          hostel_id: string | null;
          id: string;
          last_name: string | null;
          mother_mobile: string | null;
          mother_name: string | null;
          mother_occupation: string | null;
          nationality: string | null;
          notes: string | null;
          phone: string | null;
          photo_url: string | null;
          pincode: string | null;
          religion: string | null;
          school_name: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["student_status"];
          taluk: string | null;
          updated_at: string;
          user_id: string | null;
          village: string | null;
        };
        Insert: {
          aadhaar_number?: string | null;
          address?: string | null;
          admission_date?: string | null;
          admission_number: string;
          blood_group?: string | null;
          branch_id: string;
          caste?: string | null;
          category?: string | null;
          class_grade?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          custom_village?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          district?: string | null;
          email?: string | null;
          father_aadhaar?: string | null;
          father_mobile?: string | null;
          father_name?: string | null;
          father_occupation?: string | null;
          father_pan?: string | null;
          first_name: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          guardian_mobile?: string | null;
          guardian_name?: string | null;
          guardian_relationship?: string | null;
          hostel_id?: string | null;
          id?: string;
          last_name?: string | null;
          mother_mobile?: string | null;
          mother_name?: string | null;
          mother_occupation?: string | null;
          nationality?: string | null;
          notes?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          pincode?: string | null;
          religion?: string | null;
          school_name?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["student_status"];
          taluk?: string | null;
          updated_at?: string;
          user_id?: string | null;
          village?: string | null;
        };
        Update: {
          aadhaar_number?: string | null;
          address?: string | null;
          admission_date?: string | null;
          admission_number?: string;
          blood_group?: string | null;
          branch_id?: string;
          caste?: string | null;
          category?: string | null;
          class_grade?: string | null;
          country?: string | null;
          created_at?: string;
          created_by?: string | null;
          custom_village?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          district?: string | null;
          email?: string | null;
          father_aadhaar?: string | null;
          father_mobile?: string | null;
          father_name?: string | null;
          father_occupation?: string | null;
          father_pan?: string | null;
          first_name?: string;
          gender?: Database["public"]["Enums"]["gender_type"] | null;
          guardian_mobile?: string | null;
          guardian_name?: string | null;
          guardian_relationship?: string | null;
          hostel_id?: string | null;
          id?: string;
          last_name?: string | null;
          mother_mobile?: string | null;
          mother_name?: string | null;
          mother_occupation?: string | null;
          nationality?: string | null;
          notes?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          pincode?: string | null;
          religion?: string | null;
          school_name?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["student_status"];
          taluk?: string | null;
          updated_at?: string;
          user_id?: string | null;
          village?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
        ];
      };
      trusts: {
        Row: {
          accent_color: string | null;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          display_name: string;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          primary_color: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          accent_color?: string | null;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          display_name: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          primary_color?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          accent_color?: string | null;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          display_name?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          primary_color?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          branch_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          trust_id: string | null;
          user_id: string;
        };
        Insert: {
          branch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          trust_id?: string | null;
          user_id: string;
        };
        Update: {
          branch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          trust_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_trust_id_fkey";
            columns: ["trust_id"];
            isOneToOne: false;
            referencedRelation: "trusts";
            referencedColumns: ["id"];
          },
        ];
      };
      vendors: {
        Row: {
          address: string | null;
          branch_id: string;
          category: string | null;
          contact_person: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          is_active: boolean;
          name: string;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          branch_id: string;
          category?: string | null;
          contact_person?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          branch_id?: string;
          category?: string | null;
          contact_person?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      visitors: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          branch_id: string;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          entry_at: string;
          exit_at: string | null;
          hostel_id: string | null;
          id: string;
          id_proof: string | null;
          notes: string | null;
          pass_code: string;
          phone: string | null;
          purpose: string | null;
          rejected_at: string | null;
          rejected_by: string | null;
          rejection_reason: string | null;
          status: Database["public"]["Enums"]["visitor_status"];
          student_id: string | null;
          updated_at: string;
          visitor_name: string;
          visitor_type: Database["public"]["Enums"]["visitor_type"];
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          branch_id: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          entry_at?: string;
          exit_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          id_proof?: string | null;
          notes?: string | null;
          pass_code?: string;
          phone?: string | null;
          purpose?: string | null;
          rejected_at?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
          status?: Database["public"]["Enums"]["visitor_status"];
          student_id?: string | null;
          updated_at?: string;
          visitor_name: string;
          visitor_type?: Database["public"]["Enums"]["visitor_type"];
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          branch_id?: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          entry_at?: string;
          exit_at?: string | null;
          hostel_id?: string | null;
          id?: string;
          id_proof?: string | null;
          notes?: string | null;
          pass_code?: string;
          phone?: string | null;
          purpose?: string | null;
          rejected_at?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
          status?: Database["public"]["Enums"]["visitor_status"];
          student_id?: string | null;
          updated_at?: string;
          visitor_name?: string;
          visitor_type?: Database["public"]["Enums"]["visitor_type"];
        };
        Relationships: [
          {
            foreignKeyName: "visitors_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitors_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitors_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "v_hostel_occupancy";
            referencedColumns: ["hostel_id"];
          },
          {
            foreignKeyName: "visitors_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      v_hostel_occupancy: {
        Row: {
          available_beds: number | null;
          branch_id: string | null;
          hostel_id: string | null;
          hostel_name: string | null;
          occupancy_rate: number | null;
          occupied_beds: number | null;
          total_beds: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "hostels_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      can_admin_branch: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      can_manage_academics: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      can_manage_branch_ops: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      can_manage_gate: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      can_view_student: {
        Args: { _student_id: string; _user_id: string };
        Returns: boolean;
      };
      claim_super_admin: { Args: never; Returns: boolean };
      has_branch_access: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      has_trust_access: {
        Args: { _trust_id: string; _user_id: string };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      is_guardian_of: {
        Args: { _student_id: string; _user_id: string };
        Returns: boolean;
      };
      is_security: {
        Args: { _branch_id: string; _user_id: string };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
      is_super_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      admission_status:
        "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
      allocation_status: "active" | "transferred" | "vacated";
      app_role:
        | "super_admin"
        | "trust_admin"
        | "branch_admin"
        | "warden"
        | "teacher"
        | "accountant"
        | "student"
        | "parent"
        | "donor"
        | "security_guard"
        | "inventory_manager"
        | "kitchen_staff";
      asset_condition: "new" | "good" | "fair" | "poor" | "damaged" | "disposed";
      attendance_status: "present" | "absent" | "leave" | "late";
      bed_status: "available" | "occupied" | "reserved" | "maintenance";
      branch_type:
        | "main_campus"
        | "branch_campus"
        | "trust_hostel"
        | "boys_hostel"
        | "girls_hostel"
        | "residential_school"
        | "other";
      complaint_status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
      gender_type: "male" | "female" | "other";
      hostel_type: "boys" | "girls" | "mixed";
      issue_priority: "low" | "medium" | "high" | "urgent";
      issue_status: "open" | "in_progress" | "resolved" | "closed";
      leave_status: "pending" | "approved" | "rejected" | "cancelled";
      maintenance_status: "reported" | "scheduled" | "in_progress" | "completed" | "cancelled";
      meal_type: "breakfast" | "lunch" | "snacks" | "dinner";
      medical_record_type: "history" | "doctor_visit" | "vaccination" | "emergency" | "medication";
      notification_priority: "low" | "normal" | "high" | "critical";
      payment_mode: "cash" | "cheque" | "bank_transfer" | "upi" | "card" | "other";
      staff_status: "active" | "on_leave" | "inactive";
      stock_txn_type: "in" | "out" | "adjustment";
      student_status: "applicant" | "active" | "on_leave" | "alumni" | "withdrawn";
      visitor_status: "checked_in" | "checked_out" | "expected" | "denied" | "pending" | "approved" | "rejected" | "entered";
      visitor_type: "parent" | "guardian" | "guest" | "vendor" | "official" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      admission_status: ["draft", "submitted", "under_review", "approved", "rejected", "enrolled"],
      allocation_status: ["active", "transferred", "vacated"],
      app_role: [
        "super_admin",
        "trust_admin",
        "branch_admin",
        "warden",
        "teacher",
        "accountant",
        "student",
        "parent",
        "donor",
        "security_guard",
        "inventory_manager",
        "kitchen_staff",
      ],
      asset_condition: ["new", "good", "fair", "poor", "damaged", "disposed"],
      attendance_status: ["present", "absent", "leave", "late"],
      bed_status: ["available", "occupied", "reserved", "maintenance"],
      branch_type: [
        "main_campus",
        "branch_campus",
        "trust_hostel",
        "boys_hostel",
        "girls_hostel",
        "residential_school",
        "other",
      ],
      complaint_status: ["open", "assigned", "in_progress", "resolved", "closed"],
      gender_type: ["male", "female", "other"],
      hostel_type: ["boys", "girls", "mixed"],
      issue_priority: ["low", "medium", "high", "urgent"],
      issue_status: ["open", "in_progress", "resolved", "closed"],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      maintenance_status: ["reported", "scheduled", "in_progress", "completed", "cancelled"],
      meal_type: ["breakfast", "lunch", "snacks", "dinner"],
      medical_record_type: ["history", "doctor_visit", "vaccination", "emergency", "medication"],
      notification_priority: ["low", "normal", "high", "critical"],
      payment_mode: ["cash", "cheque", "bank_transfer", "upi", "card", "other"],
      staff_status: ["active", "on_leave", "inactive"],
      stock_txn_type: ["in", "out", "adjustment"],
      student_status: ["applicant", "active", "on_leave", "alumni", "withdrawn"],
      visitor_status: ["checked_in", "checked_out", "expected", "denied", "pending", "approved", "rejected", "entered"],
      visitor_type: ["parent", "guardian", "guest", "vendor", "official", "other"],
    },
  },
} as const;
