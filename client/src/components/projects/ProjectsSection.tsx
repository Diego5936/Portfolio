import { useMemo, useState } from 'react';

type Project = {
    id: string;
    title: string;
    tag: string;
    techs: string[];
};

export function ProjectsSection() {
    const projects = useMemo<Project[]>(
        () => [
            {
                id: "portfolio",
                title: "Portfolio",
                tag: "Tagg",
                techs: ["React", "Tailwind", "shadcn"],
            },
            {
                id: "rho-gamma",
                title: "Rho Gamma Server",
                tag: "Unified chapter platform",
                techs: ["AWS", "DB", "Web"],
            },
        ], []
    )

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = projects.find((p) => p.id === selectedId) ?? null;

    return (
        <section id="projects" className="py-14 sm:py-20">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
                <p className="mt-2 text-muted-foreground">
                    Click a project to focus it.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className="group text-left rounded-2xl border bg-card p-5 shadow-sm transition
                                hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                            <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                                Open
                            </span>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">{p.tag}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                            {p.techs.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            {selected && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedId(null)}
                    />

                    {/* Pop-out card */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="w-full max-w-3xl rounded-2xl border bg-card p-6 shadow-xl
                                        animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold tracking-tight">
                                        {selected.title}
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">{selected.tag}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {selected.techs.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                                >
                                    {t}
                                </span>
                                ))}
                            </div>

                            <div className="mt-6 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                                Details
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}