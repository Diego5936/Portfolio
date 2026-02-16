import * as React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--muted))_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--muted))_0%,transparent_35%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
}