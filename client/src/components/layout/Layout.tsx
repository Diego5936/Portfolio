import * as React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh text-foreground">
      <div className="portfolio-sunset-bg pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto w-full max-w-[min(100%,85rem)] px-3 sm:px-4 lg:px-5">
        {children}
      </div>
    </div>
  );
}