import { AlertCircle, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardContent,
  Textarea,
  useToast,
} from "../components/ui";
import { AudiencePicker } from "../features/feed/composer/AudiencePicker";
import { MediaPicker } from "../features/feed/composer/MediaPicker";
import { PollOptionsEditor } from "../features/feed/composer/PollOptionsEditor";
import { PostTypePicker } from "../features/feed/composer/PostTypePicker";
import { useFeed } from "../features/feed/use-feed";
import { useProfile } from "../features/profile/use-profile";
import type { Post } from "../lib/database.types";

const contentLabels: Record<Post["type"], string> = {
  text: "What do you want to share?",
  image: "Add a caption",
  video: "Add a caption",
  poll: "Ask a poll question",
  question: "What would you like to ask?",
};

const contentPlaceholders: Record<Post["type"], string> = {
  text: "Share an update with your network…",
  image: "Tell people about this image…",
  video: "Tell people about this video…",
  poll: "What should people vote on?",
  question: "Ask your network a clear question…",
};

export function CreatePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { createPost } = useFeed();
  const { toast } = useToast();
  const [type, setType] = useState<Post["type"]>("text");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] =
    useState<Post["visibility"]>("public");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleTypeChange = (nextType: Post["type"]) => {
    setType(nextType);
    setMediaFile(null);
    setFormError(null);

    if (nextType !== "poll") {
      setPollOptions(["", ""]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setIsPublishing(true);

    try {
      await createPost({
        type,
        content,
        visibility,
        mediaFile,
        pollOptions,
      });
      toast({
        title: "Post published",
        description: "It is now visible to the audience you selected.",
        variant: "success",
      });
      navigate("/", { replace: true });
    } catch (publishError) {
      setFormError(
        publishError instanceof Error
          ? publishError.message
          : "Post could not be published.",
      );
      setIsPublishing(false);
    }
  };

  return (
    <section aria-labelledby="create-title">
      <PageHeader
        id="create-title"
        title="Create post"
        description="Share something meaningful with the audience you choose."
        action={
          <Link
            to="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to feed"
            title="Back to feed"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        }
      />

      <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-5 sm:p-7 sm:pt-7">
            {formError && (
              <div
                className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {formError}
              </div>
            )}

            <PostTypePicker
              value={type}
              onChange={handleTypeChange}
              disabled={isPublishing}
            />

            <Textarea
              label={contentLabels[type]}
              placeholder={contentPlaceholders[type]}
              maxLength={5000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={isPublishing}
              required={
                type === "text" || type === "poll" || type === "question"
              }
            />

            {(type === "image" || type === "video") && (
              <MediaPicker
                key={type}
                type={type}
                value={mediaFile}
                onChange={setMediaFile}
                onError={setFormError}
                disabled={isPublishing}
              />
            )}

            {type === "poll" && (
              <PollOptionsEditor
                options={pollOptions}
                onChange={setPollOptions}
                disabled={isPublishing}
              />
            )}

            <AudiencePicker
              value={visibility}
              onChange={setVisibility}
              organisationDomain={profile?.email_domain}
              disabled={isPublishing}
            />

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-small font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                leftIcon={<Send size={17} aria-hidden="true" />}
                isLoading={isPublishing}
              >
                Publish post
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </section>
  );
}
