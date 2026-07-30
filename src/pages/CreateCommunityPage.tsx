import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Building2,
  LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  useToast,
} from "../components/ui";
import { useCommunities } from "../features/communities/use-communities";
import { useProfile } from "../features/profile/use-profile";

const DOMAIN_PATTERN =
  /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]{2,63}$/i;

export function CreateCommunityPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { createCommunity } = useCommunities();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allowedDomain, setAllowedDomain] = useState(
    profile?.email_domain ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedDomain = allowedDomain
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (name.trim().length < 3) {
      setFormError("Community names must be at least 3 characters.");
      return;
    }

    if (!DOMAIN_PATTERN.test(normalizedDomain)) {
      setFormError("Enter a valid email domain, such as college.edu.");
      return;
    }

    if (
      profile?.email_domain &&
      normalizedDomain !== profile.email_domain.toLowerCase()
    ) {
      setFormError(
        `Use your verified domain (${profile.email_domain}) so you can be added as the community owner.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const community = await createCommunity({
        name,
        description,
        allowedDomain: normalizedDomain,
      });
      toast({
        title: "Community created",
        description: "You were added as its owner.",
        variant: "success",
      });
      navigate(`/communities/${community.slug}`, { replace: true });
    } catch (createError) {
      setFormError(
        createError instanceof Error
          ? createError.message
          : "Community could not be created.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="create-community-title">
      <PageHeader
        id="create-community-title"
        title="Create community"
        description="Start a trusted space for your verified organisation."
        action={
          <Link
            to="/communities"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to communities"
            title="Back to communities"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        }
      />

      <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
        <CardContent className="pt-5 sm:p-7 sm:pt-7">
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/10 p-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-accent">
              <LockKeyhole size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-small font-semibold text-foreground">
                Domain-gated membership
              </p>
              <p className="mt-1 text-small leading-6 text-muted">
                Only verified users with the allowed email domain can join.
                This rule is enforced by the database.
              </p>
            </div>
          </div>

          {formError && (
            <div
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger"
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Community name"
              placeholder="e.g. IET DAVV Network"
              maxLength={80}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              leadingIcon={<Building2 size={18} aria-hidden="true" />}
            />
            <Textarea
              label="Description"
              placeholder="What is this community for?"
              maxLength={400}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Input
              label="Allowed email domain"
              placeholder="college.edu"
              required
              value={allowedDomain}
              onChange={(event) => setAllowedDomain(event.target.value)}
              leadingIcon={<AtSign size={18} aria-hidden="true" />}
              hint={
                profile?.email_domain
                  ? `Your verified domain is ${profile.email_domain}.`
                  : "Enter the domain without @ or an email address."
              }
            />

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Link
                to="/communities"
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-small font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Building2 size={17} aria-hidden="true" />}
              >
                Create community
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
