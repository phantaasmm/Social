import {
  AlertCircle,
  PenLine,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Avatar, Button, Card, CardContent } from "../components/ui";
import { PostCard } from "../features/feed/PostCard";
import { useFeed } from "../features/feed/use-feed";
import { useProfile } from "../features/profile/use-profile";

export function HomePage() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refreshFeed,
    loadMore,
  } = useFeed();
  const { profile } = useProfile();
  const profileName =
    profile?.display_name || profile?.username || "Your profile";

  return (
    <section aria-labelledby="home-title">
      <PageHeader
        id="home-title"
        eyebrow="Your network"
        title="Home"
        description="The latest posts from people and organisations you can access."
        action={
          <Link
            to="/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-small font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PenLine size={17} aria-hidden="true" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        }
      />

      <Link
        to="/create"
        className="mx-4 mb-4 flex min-h-16 items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0"
      >
        <Avatar
          src={profile?.avatar_url}
          name={profileName}
          size="md"
        />
        <span className="min-w-0 flex-1 truncate text-small text-muted">
          Share an update, poll, or question…
        </span>
        <Sparkles size={19} className="text-primary" aria-hidden="true" />
      </Link>

      {error && (
        <div
          className="mx-4 mb-4 flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-small text-danger sm:mx-0 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span className="flex items-start gap-2.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            {error}
          </span>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={16} aria-hidden="true" />}
            onClick={() => void refreshFeed()}
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 px-4 sm:px-0" aria-label="Loading feed">
          {[0, 1, 2].map((item) => (
            <Card
              key={item}
              className="animate-pulse rounded-card shadow-none"
            >
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-surface-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded bg-surface-2" />
                    <div className="h-3 w-24 rounded bg-surface-2" />
                  </div>
                </div>
                <div className="mt-5 h-20 rounded-lg bg-surface-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="flex min-h-80 flex-col items-center justify-center border-y border-border bg-surface px-6 py-12 text-center sm:rounded-card sm:border">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles size={27} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-h2 text-foreground">
            Your feed is ready
          </h2>
          <p className="mt-2 max-w-sm text-small leading-6 text-muted">
            Publish the first post or add friends to see their updates here.
          </p>
          <Link
            to="/create"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PenLine size={17} aria-hidden="true" />
            Create a post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasMore && (
            <div className="flex justify-center px-4 py-2 sm:px-0">
              <Button
                variant="secondary"
                isLoading={isLoadingMore}
                onClick={() => void loadMore()}
              >
                Load more posts
              </Button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="py-3 text-center text-xs text-muted">
              You’re all caught up.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
