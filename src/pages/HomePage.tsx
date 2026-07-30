import { Bell, Newspaper } from "lucide-react";
import { EmptyState } from "../components/layout/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, useToast } from "../components/ui";

export function HomePage() {
  const { toast } = useToast();

  return (
    <section aria-labelledby="home-title">
      <PageHeader
        id="home-title"
        eyebrow="Milestone 1"
        title="Home"
        description="Your trusted feed will bring updates from friends and verified communities together."
      />
      <EmptyState
        icon={Newspaper}
        title="Your feed starts here"
        description="Posts, questions, polls, and community updates will appear here after the feed milestone."
        action={
          <Button
            variant="secondary"
            leftIcon={<Bell size={18} aria-hidden="true" />}
            onClick={() =>
              toast({
                title: "The foundation is working",
                description: "Toast notifications are ready for future actions.",
                variant: "success",
              })
            }
          >
            Preview notification
          </Button>
        }
      />
    </section>
  );
}
