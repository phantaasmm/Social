import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Avatar, Button, Input, useToast } from "../../components/ui";
import type { FeedPost } from "./feed-context";
import { formatPostTime } from "./format-post-time";
import { useFeed } from "./use-feed";

interface CommentsSectionProps {
  post: FeedPost;
}

export function CommentsSection({ post }: CommentsSectionProps) {
  const { addComment } = useFeed();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isQuestion = post.type === "question";
  const singular = isQuestion ? "answer" : "comment";
  const plural = isQuestion ? "answers" : "comments";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addComment(post.id, content);
      setContent("");
    } catch (commentError) {
      toast({
        title: `Could not add ${singular}`,
        description:
          commentError instanceof Error
            ? commentError.message
            : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border bg-surface-2/45 px-4 py-4 sm:px-5">
      <h3 className="mb-3 flex items-center gap-2 text-small font-semibold text-foreground">
        <MessageCircle size={17} aria-hidden="true" />
        {post.comments.length}{" "}
        {post.comments.length === 1 ? singular : plural}
      </h3>

      {post.comments.length > 0 && (
        <div className="mb-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {post.comments.map((comment) => {
            const name =
              comment.author.display_name || comment.author.username;

            return (
              <div key={comment.id} className="flex items-start gap-2.5">
                <Avatar
                  src={comment.author.avatar_url}
                  name={name}
                  size="sm"
                />
                <div className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-xs font-semibold text-foreground">
                      {name}
                    </p>
                    <time
                      className="text-xs text-muted"
                      dateTime={comment.created_at}
                      title={new Date(comment.created_at).toLocaleString()}
                    >
                      {formatPostTime(comment.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-small text-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form
        className="flex items-start gap-2"
        onSubmit={handleSubmit}
        aria-label={`Add ${singular}`}
      >
        <Input
          aria-label={isQuestion ? "Write an answer" : "Write a comment"}
          placeholder={isQuestion ? "Write an answer…" : "Write a comment…"}
          maxLength={1000}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="icon"
          aria-label={`Submit ${singular}`}
          title={`Submit ${singular}`}
          isLoading={isSubmitting}
          disabled={!content.trim()}
        >
          <Send size={17} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
