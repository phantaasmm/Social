import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  Comment,
  PollVote,
  Post,
  PostLike,
  Profile,
} from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/use-auth";
import { useProfile } from "../profile/use-profile";
import {
  FeedContext,
  type CreatePostInput,
  type FeedContextValue,
  type FeedPost,
} from "./feed-context";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "./feed-limits";

const PAGE_SIZE = 10;

interface FeedProviderProps {
  children: ReactNode;
}

function fileExtension(file: File) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
  };

  return extensionByType[file.type] ?? "bin";
}

function assertMediaFile(type: Post["type"], file: File) {
  if (type === "image") {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Images must be 10 MB or smaller.");
    }
  }

  if (type === "video") {
    if (!ACCEPTED_VIDEO_TYPES.has(file.type)) {
      throw new Error("Choose an MP4, WebM, or Ogg video.");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Videos must be 50 MB or smaller.");
    }
  }
}

export function FeedProvider({ children }: FeedProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const hasLoadedRef = useRef(false);

  const hydratePosts = useCallback(async (postRows: Post[]) => {
    if (postRows.length === 0) {
      return [];
    }

    const postIds = postRows.map((post) => post.id);
    const [
      pollOptionsResult,
      pollVotesResult,
      commentsResult,
      likesResult,
    ] = await Promise.all([
      supabase
        .from("poll_options")
        .select("id, post_id, option_text, position")
        .in("post_id", postIds)
        .order("position", { ascending: true }),
      supabase
        .from("poll_votes")
        .select("id, post_id, option_id, voter_id, created_at")
        .in("post_id", postIds),
      supabase
        .from("comments")
        .select("id, post_id, author_id, content, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("post_likes")
        .select("post_id, user_id, created_at")
        .in("post_id", postIds),
    ]);

    const childError =
      pollOptionsResult.error ??
      pollVotesResult.error ??
      commentsResult.error ??
      likesResult.error;

    if (childError) {
      throw new Error(`Post details could not be loaded: ${childError.message}`);
    }

    const comments = commentsResult.data ?? [];
    const profileIds = Array.from(
      new Set([
        ...postRows.map((post) => post.author_id),
        ...comments.map((comment) => comment.author_id),
      ]),
    );

    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at",
      )
      .in("id", profileIds);

    if (profilesError) {
      throw new Error(
        `Post authors could not be loaded: ${profilesError.message}`,
      );
    }

    const profilesById = Object.fromEntries(
      (profileRows ?? []).map((item) => [item.id, item]),
    ) as Record<string, Profile>;
    const pollOptions = pollOptionsResult.data ?? [];
    const pollVotes = pollVotesResult.data ?? [];
    const likes = likesResult.data ?? [];

    return postRows
      .map((post): FeedPost | null => {
        const author = profilesById[post.author_id];

        if (!author) {
          return null;
        }

        return {
          ...post,
          author,
          pollOptions: pollOptions.filter(
            (option) => option.post_id === post.id,
          ),
          pollVotes: pollVotes.filter((vote) => vote.post_id === post.id),
          comments: comments
            .filter((comment) => comment.post_id === post.id)
            .map((comment) => ({
              ...comment,
              author: profilesById[comment.author_id],
            }))
            .filter(
              (
                comment,
              ): comment is Comment & {
                author: Profile;
              } => Boolean(comment.author),
            ),
          likes: likes.filter((like) => like.post_id === post.id),
        };
      })
      .filter((post): post is FeedPost => Boolean(post));
  }, []);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (!user) {
        return { hydrated: [] as FeedPost[], rowCount: 0 };
      }

      const { data, error: postsError } = await supabase
        .from("posts")
        .select(
          "id, author_id, type, content, media_url, visibility, organisation_domain, created_at",
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (postsError) {
        throw new Error(`Feed could not be loaded: ${postsError.message}`);
      }

      const rows = data ?? [];
      return {
        hydrated: await hydratePosts(rows),
        rowCount: rows.length,
      };
    },
    [hydratePosts, user],
  );

  const refreshFeed = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setError(null);
      setHasMore(false);
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { hydrated, rowCount } = await fetchPage(0);
      setPosts(hydrated);
      setHasMore(rowCount === PAGE_SIZE);
      hasLoadedRef.current = true;
    } catch (feedError) {
      setPosts([]);
      setHasMore(false);
      setError(
        feedError instanceof Error
          ? feedError.message
          : "Feed could not be loaded.",
      );
      hasLoadedRef.current = true;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshFeed();
  }, [isAuthLoading, refreshFeed]);

  const loadMore = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const { hydrated, rowCount } = await fetchPage(posts.length);
      setPosts((current) => {
        const existingIds = new Set(current.map((post) => post.id));
        return [
          ...current,
          ...hydrated.filter((post) => !existingIds.has(post.id)),
        ];
      });
      setHasMore(rowCount === PAGE_SIZE);
    } catch (feedError) {
      setError(
        feedError instanceof Error
          ? feedError.message
          : "More posts could not be loaded.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore, posts.length, user]);

  const createPost = useCallback(
    async ({
      type,
      content,
      visibility,
      mediaFile,
      pollOptions = [],
    }: CreatePostInput) => {
      if (!user || !profile) {
        throw new Error("Your profile is still loading. Please try again.");
      }

      const trimmedContent = content.trim();

      if (
        (type === "text" || type === "poll" || type === "question") &&
        !trimmedContent
      ) {
        throw new Error("Add some text before publishing.");
      }

      if ((type === "image" || type === "video") && !mediaFile) {
        throw new Error(`Choose a ${type} before publishing.`);
      }

      const normalizedOptions = pollOptions
        .map((option) => option.trim())
        .filter(Boolean);

      if (
        type === "poll" &&
        (normalizedOptions.length < 2 || normalizedOptions.length > 6)
      ) {
        throw new Error("Polls need between 2 and 6 options.");
      }

      let uploadedPath: string | null = null;
      let mediaUrl: string | null = null;

      if (mediaFile) {
        assertMediaFile(type, mediaFile);
        uploadedPath = `posts/${user.id}/${crypto.randomUUID()}.${fileExtension(mediaFile)}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(uploadedPath, mediaFile, {
            cacheControl: "3600",
            contentType: mediaFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Media upload failed: ${uploadError.message}`);
        }

        mediaUrl = supabase.storage
          .from("media")
          .getPublicUrl(uploadedPath).data.publicUrl;
      }

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          type,
          content: trimmedContent || null,
          media_url: mediaUrl,
          visibility,
          organisation_domain:
            visibility === "organisation" ? profile.email_domain : null,
        })
        .select(
          "id, author_id, type, content, media_url, visibility, organisation_domain, created_at",
        )
        .single();

      if (postError) {
        if (uploadedPath) {
          await supabase.storage.from("media").remove([uploadedPath]);
        }
        throw new Error(`Post could not be published: ${postError.message}`);
      }

      if (type === "poll") {
        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(
            normalizedOptions.map((option, index) => ({
              post_id: post.id,
              option_text: option,
              position: index,
            })),
          );

        if (optionsError) {
          await supabase.from("posts").delete().eq("id", post.id);
          throw new Error(
            `Poll options could not be saved: ${optionsError.message}`,
          );
        }
      }

      await refreshFeed();
      return post;
    },
    [profile, refreshFeed, user],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) {
        throw new Error("Sign in before liking a post.");
      }

      const post = posts.find((item) => item.id === postId);

      if (!post) {
        throw new Error("This post is no longer available.");
      }

      const existingLike = post.likes.find(
        (like) => like.user_id === user.id,
      );

      if (existingLike) {
        const { error: unlikeError } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (unlikeError) {
          throw new Error(`Like could not be removed: ${unlikeError.message}`);
        }

        setPosts((current) =>
          current.map((item) =>
            item.id === postId
              ? {
                  ...item,
                  likes: item.likes.filter(
                    (like) => like.user_id !== user.id,
                  ),
                }
              : item,
          ),
        );
        return;
      }

      const { data, error: likeError } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id })
        .select("post_id, user_id, created_at")
        .single();

      if (likeError) {
        if (likeError.code === "23505") {
          throw new Error("You already liked this post.");
        }
        throw new Error(`Post could not be liked: ${likeError.message}`);
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === postId
            ? { ...item, likes: [...item.likes, data as PostLike] }
            : item,
        ),
      );
    },
    [posts, user],
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!user || !profile) {
        throw new Error("Your profile is still loading. Please try again.");
      }

      const trimmedContent = content.trim();

      if (!trimmedContent) {
        throw new Error("Write something before submitting.");
      }

      const { data, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: user.id,
          content: trimmedContent,
        })
        .select("id, post_id, author_id, content, created_at")
        .single();

      if (commentError) {
        throw new Error(`Response could not be added: ${commentError.message}`);
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  { ...(data as Comment), author: profile },
                ],
              }
            : post,
        ),
      );
    },
    [profile, user],
  );

  const castPollVote = useCallback(
    async (postId: string, optionId: string) => {
      if (!user) {
        throw new Error("Sign in before voting.");
      }

      const post = posts.find((item) => item.id === postId);

      if (post?.pollVotes.some((vote) => vote.voter_id === user.id)) {
        throw new Error("You have already voted in this poll.");
      }

      const { data, error: voteError } = await supabase
        .from("poll_votes")
        .insert({
          post_id: postId,
          option_id: optionId,
          voter_id: user.id,
        })
        .select("id, post_id, option_id, voter_id, created_at")
        .single();

      if (voteError) {
        if (voteError.code === "23505") {
          throw new Error("You have already voted in this poll.");
        }
        throw new Error(`Vote could not be recorded: ${voteError.message}`);
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === postId
            ? {
                ...item,
                pollVotes: [...item.pollVotes, data as PollVote],
              }
            : item,
        ),
      );
    },
    [posts, user],
  );

  const value = useMemo<FeedContextValue>(
    () => ({
      posts,
      isLoading,
      isLoadingMore,
      error,
      hasMore,
      refreshFeed,
      loadMore,
      createPost,
      toggleLike,
      addComment,
      castPollVote,
    }),
    [
      addComment,
      castPollVote,
      createPost,
      error,
      hasMore,
      isLoading,
      isLoadingMore,
      loadMore,
      posts,
      refreshFeed,
      toggleLike,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
