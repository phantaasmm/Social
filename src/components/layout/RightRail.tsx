import { Check, Compass, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";

const readinessItems = [
  "Responsive navigation",
  "Light and dark themes",
  "Shared UI components",
];

export function RightRail() {
  return (
    <aside
      className="hidden space-y-4 xl:block"
      aria-label="Project information"
    >
      <Card>
        <CardHeader>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={21} aria-hidden="true" />
          </div>
          <CardTitle className="text-h3">Foundation ready</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {readinessItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-small text-muted"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-surface-2/60 shadow-none">
        <CardContent className="pt-5 sm:pt-6">
          <div className="flex gap-3">
            <Compass
              size={20}
              className="mt-0.5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div>
              <p className="text-small font-semibold text-foreground">
                Up next
              </p>
              <p className="mt-1 text-small leading-6 text-muted">
                Authentication and verified profiles arrive in Milestone 2.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
