import { BadgeCheck, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Brand } from "../layout/Brand";
import { ThemeToggle } from "../../theme/ThemeToggle";

const trustPoints = [
  {
    icon: BadgeCheck,
    title: "Verified identities",
    description: "Official college and company email verification.",
  },
  {
    icon: UsersRound,
    title: "Trusted communities",
    description: "Organisation spaces gated by verified email domain.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy by design",
    description: "You decide who can see what you share.",
  },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background lg:grid lg:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)]">
      <a
        href="#auth-main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-surface px-4 py-2 text-small font-semibold text-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <aside className="relative hidden min-h-screen overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/15 bg-white/5"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full border border-white/10 bg-white/5"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-h3 font-bold text-primary shadow-lg">
            C
          </span>
          <span>
            <span className="block text-h3 font-bold">CommonGround</span>
            <span className="block text-xs text-white/85">
              Trust starts with verification
            </span>
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg py-12">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck size={15} aria-hidden="true" />
            A trusted social network
          </div>
          <h1 className="text-[36px] font-bold leading-[1.15] tracking-tight xl:text-[42px]">
            Real people.
            <br />
            Real communities.
          </h1>
          <p className="mt-5 max-w-md text-body leading-7 text-white/85">
            Connect through the official email that belongs to your college or
            company.
          </p>

          <div className="mt-10 space-y-5">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.title} className="flex items-start gap-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-small font-semibold">{point.title}</p>
                    <p className="mt-0.5 text-small text-white/80">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/80">
          Built for verified college and company networks.
        </p>
      </aside>

      <main id="auth-main" className="relative flex min-h-screen flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-8 lg:border-b-0">
          <Brand className="lg:hidden" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
