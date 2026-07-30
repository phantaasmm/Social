import { createContext } from "react";
import type {
  Community,
  CommunityMember,
} from "../../lib/database.types";

export interface CommunityWithCount extends Community {
  member_count: number;
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  allowedDomain: string;
}

export interface CommunitiesContextValue {
  communities: CommunityWithCount[];
  memberships: CommunityMember[];
  isLoading: boolean;
  error: string | null;
  refreshCommunities: () => Promise<void>;
  getMembership: (communityId: string) => CommunityMember | undefined;
  createCommunity: (
    input: CreateCommunityInput,
  ) => Promise<Community>;
  joinCommunity: (community: Community) => Promise<void>;
  leaveCommunity: (community: Community) => Promise<void>;
}

export const CommunitiesContext =
  createContext<CommunitiesContextValue | null>(null);
