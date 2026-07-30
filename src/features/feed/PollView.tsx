import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../components/ui";
import { cn } from "../../lib/cn";
import { useAuth } from "../auth/use-auth";
import type { FeedPost } from "./feed-context";
import { useFeed } from "./use-feed";

interface PollViewProps {
  post: FeedPost;
}

export function PollView({ post }: PollViewProps) {
  const { user } = useAuth();
  const { castPollVote } = useFeed();
  const { toast } = useToast();
  const [busyOptionId, setBusyOptionId] = useState<string | null>(null);
  const ownVote = post.pollVotes.find((vote) => vote.voter_id === user?.id);
  const totalVotes = post.pollVotes.length;
  const showResults = Boolean(ownVote);

  const handleVote = async (optionId: string) => {
    setBusyOptionId(optionId);

    try {
      await castPollVote(post.id, optionId);
      toast({
        title: "Vote recorded",
        variant: "success",
      });
    } catch (voteError) {
      toast({
        title: "Could not vote",
        description:
          voteError instanceof Error ? voteError.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusyOptionId(null);
    }
  };

  if (post.pollOptions.length === 0) {
    return (
      <div className="rounded-lg border border-danger/25 bg-danger/10 p-3 text-small text-danger">
        Poll options are unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {post.pollOptions.map((option) => {
        const optionVotes = post.pollVotes.filter(
          (vote) => vote.option_id === option.id,
        ).length;
        const percentage =
          totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
        const isSelected = ownVote?.option_id === option.id;
        const isBusy = busyOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            className={cn(
              "relative min-h-12 w-full overflow-hidden rounded-lg border px-4 py-3 text-left text-small font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              showResults
                ? "cursor-default border-border bg-surface-2"
                : "border-border bg-surface hover:border-primary hover:bg-primary/5",
              isSelected && "border-primary text-primary",
            )}
            disabled={showResults || Boolean(busyOptionId)}
            onClick={() => void handleVote(option.id)}
          >
            {showResults && (
              <span
                className="absolute inset-y-0 left-0 bg-primary/10 transition-[width]"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
              />
            )}
            <span className="relative flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                {isSelected && (
                  <Check
                    size={16}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="break-words">{option.option_text}</span>
              </span>
              {isBusy ? (
                <LoaderCircle
                  size={17}
                  className="shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : showResults ? (
                <span className="shrink-0 text-xs font-semibold text-muted">
                  {percentage}%
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
      <p className="pt-1 text-xs text-muted">
        {showResults
          ? `${totalVotes} ${totalVotes === 1 ? "vote" : "votes"}`
          : "Vote to see the results"}
      </p>
    </div>
  );
}
