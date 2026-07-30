import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileHeader />

      <main className="pb-24 lg:ml-64 lg:pb-10">
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
