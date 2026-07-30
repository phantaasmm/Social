import {
  Building2,
  CircleHelp,
  Globe2,
  Heart,
  ListChecks,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Avatar, Card, useToast } from "../../components/ui";
import { cn } from "../../lib/cn";
import { useAuth } from "../auth/use-auth";
import { CommentsSection } from "./CommentsSection";
import type { FeedPost } from "./feed-context";
import { formatPostTime } from "./format-post-time";
import { LazyVideo } from "./LazyVideo";
import { PollView } from "./PollView";
import { useFeed } from "./use-feed";

interface PostCardProps {
  post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toggleLike } = useFeed();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(
    post.type === "question",
  );
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const authorName = post.author.display_name || post.author.username;
  const isLiked = post.likes.some((like) => like.user_id === user?.id);
  const isQuestion = post.type === "question";

  const visibility = {
    public: { label: "Public", icon: Globe2 },
    friends: { label: "Friends", icon: UsersRound },
    organisation: {
      label: post.organisation_domain || "Organisation",
      icon: Building2,
    },
  }[post.visibility];
  const VisibilityIcon = visibility.icon;

  const handleLike = async () => {
    setIsLikeBusy(true);

    try {
      await toggleLike(post.id);
    } catch (likeError) {
      toast({
        title: "Could not update like",
        description:
          likeError instanceof Error ? likeError.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsLikeBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-none border-x-0 sm:rounded-card sm:border-x">
      <article aria-labelledby={`post-${post.id}-author`}>
        <header className="flex items-start gap-3 p-4 sm:p-5">
          <Avatar
            src={post.author.avatar_url}
            name={authorName}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2
                id={`post-${post.id}-author`}
                className="truncate text-small font-semibold text-foreground"
              >
                {authorName}
              </h2>
              <span className="truncate text-xs text-muted">
                @{post.author.username}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <time
                dateTime={post.created_at}
                title={new Date(post.created_at).toLocaleString()}
              >
                {formatPostTime(post.created_at)}
              </time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <VisibilityIcon size={13} aria-hidden="true" />
                {visibility.label}
              </span>
              {post.type === "poll" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    <ListChecks size={13} aria-hidden="true" />
                    Poll
                  </span>
                </>
              )}
              {isQuestion && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-accent">
                    <CircleHelp size={13} aria-hidden="true" />
                    Question
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {(post.content || post.type === "poll") && (
          <div className="px-4 pb-4 sm:px-5">
            {post.content && (
              <p
                className={cn(
                  "whitespace-pre-wrap break-words text-body leading-7 text-foreground",
                  (post.type === "poll" || isQuestion) &&
                    "text-h3 font-semibold",
                )}
              >
                {post.content}
              </p>
            )}
            {post.type === "poll" && (
              <div className="mt-4">
                <PollView post={post} />
              </div>
            )}
          </div>
        )}

        {post.type === "image" && post.media_url && (
          <div className="border-y border-border bg-surface-2">
            <img
              src={post.media_url}
              alt={post.content || `Image shared by ${authorName}`}
              loading="lazy"
              decoding="async"
              className="max-h-[620px] w-full object-contain"
            />
          </div>
        )}

        {post.type === "video" && post.media_url && (
          <div className="border-y border-border">
            <LazyVideo
              src={post.media_url}
              label={`Video shared by ${authorName}`}
            />
          </div>
        )}

        <div className="flex items-center border-t border-border px-3 py-2 sm:px-4">
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-small font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              isLiked ? "text-danger" : "text-muted",
            )}
            onClick={() => void handleLike()}
            disabled={isLikeBusy}
            aria-pressed={isLiked}
          >
            <Heart
              size={19}
              fill={isLiked ? "currentColor" : "none"}
              aria-hidden="true"
            />
            {post.likes.length > 0 ? post.likes.length : "Like"}
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-small font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              showComments ? "text-primary" : "text-muted",
            )}
            onClick={() => setShowComments((current) => !current)}
            aria-expanded={showComments}
          >
            <MessageCircle size={19} aria-hidden="true" />
            {post.comments.length > 0
              ? post.comments.length
              : isQuestion
                ? "Answer"
                : "Comment"}
          </button>
        </div>

        {showComments && <CommentsSection post={post} />}
      </article>
    </Card>
  );
}
