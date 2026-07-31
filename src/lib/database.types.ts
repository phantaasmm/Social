export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          email_domain: string;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          email_domain: string;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          email_domain?: string;
          is_private?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted";
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted";
          created_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: "pending" | "accepted";
          created_at?: string;
        };
        Relationships: [];
      };
      communities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          owner_id: string;
          allowed_domain: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          owner_id: string;
          allowed_domain: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          owner_id?: string;
          allowed_domain?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      community_members: {
        Row: {
          community_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          joined_at: string;
        };
        Insert: {
          community_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          joined_at?: string;
        };
        Update: {
          community_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey";
            columns: ["community_id"];
            isOneToOne: false;
            referencedRelation: "communities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          type: "text" | "image" | "video" | "poll" | "question";
          content: string | null;
          media_url: string | null;
          visibility: "public" | "friends" | "organisation";
          organisation_domain: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          type: "text" | "image" | "video" | "poll" | "question";
          content?: string | null;
          media_url?: string | null;
          visibility: "public" | "friends" | "organisation";
          organisation_domain?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          type?: "text" | "image" | "video" | "poll" | "question";
          content?: string | null;
          media_url?: string | null;
          visibility?: "public" | "friends" | "organisation";
          organisation_domain?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      poll_options: {
        Row: {
          id: string;
          post_id: string;
          option_text: string;
          position: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          option_text: string;
          position: number;
        };
        Update: {
          id?: string;
          post_id?: string;
          option_text?: string;
          position?: number;
        };
        Relationships: [];
      };
      poll_votes: {
        Row: {
          id: string;
          post_id: string;
          option_id: string;
          voter_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          option_id: string;
          voter_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          option_id?: string;
          voter_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          white_player_id: string;
          black_player_id: string;
          fen: string;
          pgn: string;
          turn: "w" | "b";
          status: "pending" | "active" | "finished";
          winner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          white_player_id: string;
          black_player_id: string;
          fen: string;
          pgn: string;
          turn?: "w" | "b";
          status?: "pending" | "active" | "finished";
          winner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          white_player_id?: string;
          black_player_id?: string;
          fen?: string;
          pgn?: string;
          turn?: "w" | "b";
          status?: "pending" | "active" | "finished";
          winner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "games_white_player_id_fkey";
            columns: ["white_player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_black_player_id_fkey";
            columns: ["black_player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_winner_id_fkey";
            columns: ["winner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];
export type Friendship =
  Database["public"]["Tables"]["friendships"]["Row"];
export type Community =
  Database["public"]["Tables"]["communities"]["Row"];
export type CommunityMember =
  Database["public"]["Tables"]["community_members"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PollOption =
  Database["public"]["Tables"]["poll_options"]["Row"];
export type PollVote =
  Database["public"]["Tables"]["poll_votes"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type PostLike =
  Database["public"]["Tables"]["post_likes"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
