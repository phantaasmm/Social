import { LockKeyhole, UserRound } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Tabs,
} from "../components/ui";

export function ProfilePage() {
  const tabItems = [
    {
      id: "posts",
      label: "Posts",
      content: (
        <p className="py-8 text-center text-small text-muted">
          Your posts will appear here.
        </p>
      ),
    },
    {
      id: "about",
      label: "About",
      content: (
        <p className="py-8 text-center text-small text-muted">
          Add a bio and verified organisation in Milestone 2.
        </p>
      ),
    },
  ];

  return (
    <section aria-labelledby="profile-title">
      <PageHeader
        id="profile-title"
        title="Profile"
        description="Your identity, connections, and contributions in one place."
      />
      <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar name="Your profile" size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-h2 text-foreground">Your profile</h2>
            <p className="mt-1 flex items-center gap-1.5 text-small text-muted">
              <LockKeyhole size={15} aria-hidden="true" />
              Profile setup arrives in Milestone 2
            </p>
          </div>
          <span className="hidden h-11 w-11 items-center justify-center rounded-lg bg-surface-2 text-muted sm:inline-flex">
            <UserRound size={20} aria-hidden="true" />
          </span>
        </CardHeader>
        <CardContent className="pb-1">
          <Tabs items={tabItems} />
        </CardContent>
      </Card>
    </section>
  );
}
