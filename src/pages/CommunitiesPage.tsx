import { Building2, Plus } from "lucide-react";
import { EmptyState } from "../components/layout/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, useToast } from "../components/ui";

export function CommunitiesPage() {
  const { toast } = useToast();

  return (
    <section aria-labelledby="communities-title">
      <PageHeader
        id="communities-title"
        title="Communities"
        description="Spaces reserved for people with the same verified organisation domain."
      />
      <EmptyState
        icon={Building2}
        title="Find your people"
        description="Browse and join domain-gated college or company spaces in Milestone 5."
        action={
          <Button
            variant="secondary"
            leftIcon={<Plus size={18} aria-hidden="true" />}
            onClick={() =>
              toast({
                title: "Community creation arrives in Milestone 5",
                description:
                  "Domain eligibility will be enforced securely by the database.",
              })
            }
          >
            Create community
          </Button>
        }
      />
    </section>
  );
}
