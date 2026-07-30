import { createContext } from "react";
import type {
  Comment,
  PollOption,
  PollVote,
  Post,
  PostLike,
  Profile,
} from "../../lib/database.types";

export interface FeedComment extends Comment {
  author: Profile;
}

export interface FeedPost extends Post {
  author: Profile;
  pollOptions: PollOption[];
  pollVotes: PollVote[];
  comments: FeedComment[];
  likes: PostLike[];
}

export interface CreatePostInput {
  type: Post["type"];
  content: string;
  visibility: Post["visibility"];
  mediaFile?: File | null;
  pollOptions?: string[];
}

export interface FeedContextValue {
  posts: FeedPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<Post>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  castPollVote: (postId: string, optionId: string) => Promise<void>;
}

export const FeedContext = createContext<FeedContextValue | null>(null);
