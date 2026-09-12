"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronsUpDown } from "lucide-react";
import { NAV_PRIMARY, NAV_SECONDARY, type NavItem } from "@/lib/nav";
import { USER } from "@/lib/mock-data";
import { cn } from "@/components/ui/primitives";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-9 items-center gap-2 rounded-xl px-2 text-[14px] leading-5 transition-colors duration-200",
        active
          ? "bg-bg-elevated text-text"
          : "text-text-muted hover:bg-bg-hover hover:text-text-secondary",
      )}
    >
      <Icon
        className={cn("h-5 w-5", active ? "text-text" : "text-text-muted")}
        strokeWidth={1.67}
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[296px] shrink-0 flex-col justify-between overflow-y-auto py-5">
      <div className="mx-auto flex w-full max-w-[264px] flex-col gap-5 px-4">
        <div className="flex h-[43px] items-center gap-2 rounded-xl bg-bg-elevated px-2">
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full border border-white/20 bg-black text-[10px] font-medium text-text">
            V
          </span>
          <p className="text-[14px] leading-5 text-white">{USER.workspace}</p>
        </div>

        <div>
          <div className="flex flex-col gap-2 border-b border-border py-4">
            {NAV_PRIMARY.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
          <div className="flex flex-col gap-2 py-4">
            {NAV_SECONDARY.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[264px] px-4">
        <div className="flex h-10 items-center justify-between rounded-xl px-3">
          <div className="flex items-center gap-2">
            <img
              src={USER.avatar}
              alt={USER.displayName}
              className="h-[22px] w-[22px] rounded-full object-cover"
            />
            <p className="text-[14px] font-medium leading-5 text-text">
              {USER.displayName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-text-dim">
            <ChevronsUpDown className="h-5 w-5" strokeWidth={1.5} />
            <Bell className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </aside>
  );
}
