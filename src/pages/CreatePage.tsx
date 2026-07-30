import { FilePlus2, Sparkles } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../components/layout/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, Modal } from "../components/ui";

export function CreatePage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <section aria-labelledby="create-title">
      <PageHeader
        id="create-title"
        title="Create"
        description="Share something meaningful with the audience you choose."
      />
      <EmptyState
        icon={FilePlus2}
        title="The composer is coming"
        description="Text, image, video, poll, and question posts will be added in Milestone 6."
        action={
          <Button
            leftIcon={<Sparkles size={18} aria-hidden="true" />}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview dialog
          </Button>
        }
      />

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="A focused place to create"
        description="This accessible modal is part of the shared M1 component library."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsPreviewOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled>Continue in Milestone 6</Button>
          </>
        }
      >
        <p className="text-body leading-7 text-muted">
          The future composer will use this space for post content, media,
          polls, and audience controls.
        </p>
      </Modal>
    </section>
  );
}
