import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  Community,
  CommunityMember,
} from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/use-auth";
import { useProfile } from "../profile/use-profile";
import {
  CommunitiesContext,
  type CommunitiesContextValue,
  type CommunityWithCount,
  type CreateCommunityInput,
} from "./communities-context";

interface CommunitiesProviderProps {
  children: ReactNode;
}

function makeSlug(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = crypto.randomUUID().split("-")[0];

  return `${base || "community"}-${suffix}`;
}

function isDomainPolicyError(message: string) {
  return /row-level security|policy|permission denied/i.test(message);
}

export function CommunitiesProvider({
  children,
}: CommunitiesProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { profile } = useProfile();
  const [communities, setCommunities] = useState<CommunityWithCount[]>([]);
  const [memberships, setMemberships] = useState<CommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refreshCommunities = useCallback(async () => {
    if (!user) {
      setCommunities([]);
      setMemberships([]);
      setError(null);
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    setError(null);

    const [communitiesResult, membershipsResult] = await Promise.all([
      supabase
        .from("communities")
        .select(
          "id, name, slug, description, owner_id, allowed_domain, created_at, community_members(count)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("community_members")
        .select("community_id, user_id, role, joined_at")
        .eq("user_id", user.id),
    ]);

    if (communitiesResult.error) {
      setCommunities([]);
      setMemberships([]);
      setError(
        `Communities could not be loaded: ${communitiesResult.error.message}`,
      );
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    if (membershipsResult.error) {
      setCommunities([]);
      setMemberships([]);
      setError(
        `Memberships could not be loaded: ${membershipsResult.error.message}`,
      );
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    const nextCommunities: CommunityWithCount[] = (
      communitiesResult.data ?? []
    ).map(({ community_members: memberCounts, ...community }) => ({
      ...community,
      member_count: memberCounts?.[0]?.count ?? 0,
    }));

    setCommunities(nextCommunities);
    setMemberships(membershipsResult.data ?? []);
    setIsLoading(false);
    hasLoadedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshCommunities();
  }, [isAuthLoading, refreshCommunities]);

  const getMembership = useCallback(
    (communityId: string) =>
      memberships.find(
        (membership) => membership.community_id === communityId,
      ),
    [memberships],
  );

  const createCommunity = useCallback(
    async ({
      name,
      description,
      allowedDomain,
    }: CreateCommunityInput) => {
      if (!user) {
        throw new Error("Sign in before creating a community.");
      }

      let createdCommunity: Community | null = null;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data, error: createError } = await supabase
          .from("communities")
          .insert({
            name: name.trim(),
            slug: makeSlug(name),
            description: description.trim() || null,
            owner_id: user.id,
            allowed_domain: allowedDomain.trim().toLowerCase(),
          })
          .select(
            "id, name, slug, description, owner_id, allowed_domain, created_at",
          )
          .single();

        if (!createError) {
          createdCommunity = data;
          break;
        }

        lastError = new Error(
          `Community could not be created: ${createError.message}`,
        );

        if (createError.code !== "23505") {
          break;
        }
      }

      if (!createdCommunity) {
        throw lastError ?? new Error("Community could not be created.");
      }

      const { error: ownerMembershipError } = await supabase
        .from("community_members")
        .insert({
          community_id: createdCommunity.id,
          user_id: user.id,
          role: "owner",
        });

      if (ownerMembershipError) {
        await supabase
          .from("communities")
          .delete()
          .eq("id", createdCommunity.id);
        throw new Error(
          `Owner membership could not be created: ${ownerMembershipError.message}`,
        );
      }

      await refreshCommunities();
      return createdCommunity;
    },
    [refreshCommunities, user],
  );

  const joinCommunity = useCallback(
    async (community: Community) => {
      if (!user) {
        throw new Error("Sign in before joining a community.");
      }

      if (getMembership(community.id)) {
        return;
      }

      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: "member",
        });

      if (joinError) {
        const domainMismatch =
          profile?.email_domain.toLowerCase() !==
          community.allowed_domain.toLowerCase();

        if (domainMismatch || isDomainPolicyError(joinError.message)) {
          throw new Error(
            `Only members of ${community.allowed_domain} can join this community.`,
          );
        }

        throw new Error(`Community could not be joined: ${joinError.message}`);
      }

      await refreshCommunities();
    },
    [getMembership, profile, refreshCommunities, user],
  );

  const leaveCommunity = useCallback(
    async (community: Community) => {
      if (!user) {
        throw new Error("Sign in before leaving a community.");
      }

      const membership = getMembership(community.id);

      if (!membership) {
        return;
      }

      if (membership.role === "owner") {
        throw new Error(
          "Community owners cannot leave without transferring ownership.",
        );
      }

      const { error: leaveError } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", community.id)
        .eq("user_id", user.id);

      if (leaveError) {
        throw new Error(`Community could not be left: ${leaveError.message}`);
      }

      await refreshCommunities();
    },
    [getMembership, refreshCommunities, user],
  );

  const value = useMemo<CommunitiesContextValue>(
    () => ({
      communities,
      memberships,
      isLoading,
      error,
      refreshCommunities,
      getMembership,
      createCommunity,
      joinCommunity,
      leaveCommunity,
    }),
    [
      communities,
      createCommunity,
      error,
      getMembership,
      isLoading,
      joinCommunity,
      leaveCommunity,
      memberships,
      refreshCommunities,
    ],
  );

  return (
    <CommunitiesContext.Provider value={value}>
      {children}
    </CommunitiesContext.Provider>
  );
}
