import { Search, UserSearch } from "lucide-react";
import { EmptyState } from "../components/layout/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { Input } from "../components/ui";

export function SearchPage() {
  return (
    <section aria-labelledby="search-title">
      <PageHeader
        id="search-title"
        title="Search"
        description="Find people by username or display name."
      />
      <div className="mb-4 px-4 sm:px-0">
        <Input
          aria-label="Search people"
          leadingIcon={<Search size={19} aria-hidden="true" />}
          placeholder="Search verified people"
          hint="User search will be connected in Milestone 4."
        />
      </div>
      <EmptyState
        icon={UserSearch}
        title="Meet your network"
        description="Search results and friend-request controls will appear here once profiles and friendships are connected."
      />
    </section>
  );
}
