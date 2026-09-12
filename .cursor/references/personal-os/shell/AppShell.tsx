"use client";

import { type ReactNode } from "react";
import { PageTransition } from "@/components/shell/PageTransition";
import { Sidebar } from "@/components/shell/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-root">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-bg-root">
        <div className="mx-auto w-full max-w-[1200px] px-6 pb-16">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
