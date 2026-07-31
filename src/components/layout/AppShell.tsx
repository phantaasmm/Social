import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-lg bg-primary px-4 py-2 text-small font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Sidebar />
      <MobileHeader />

      <main id="main-content" className="min-w-0 pb-24 lg:ml-64 lg:pb-10">
        <div className="mx-auto grid max-w-[600px] grid-cols-1 justify-center gap-6 px-0 py-0 sm:px-5 sm:py-6 xl:max-w-[984px] xl:grid-cols-[minmax(0,600px)_320px]">
          <div className="min-w-0">
            <Outlet />
          </div>
          <RightRail />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
