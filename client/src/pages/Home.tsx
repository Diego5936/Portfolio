import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { DiffusionPanel } from "@/components/home/DiffusionPanel";
import { Diego } from "@/components/home/Diego";
import { AboutSection } from "@/components/sections/AboutSection";
import { ReadmeSection } from "@/components/sections/ReadmeSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function Home() {
  useEffect(() => {
    const sectionId = window.location.hash.replace("#", "");
    if (!sectionId) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: "start" });
    });
  }, []);

  return (
    <Layout>
      <main>
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          <aside
            className="relative mb-10 lg:mb-0"
            aria-label="Portrait and diffusion panel"
          >
            <div className="pt-14 sm:pt-20 lg:sticky lg:top-16">
              <DiffusionPanel />
            </div>
          </aside>

          <div className="min-w-0">
            <section
              id="home"
              className="scroll-mt-14 flex min-h-[calc(100dvh-var(--portfolio-header-height))] flex-col sm:scroll-mt-16"
            >
              <div className="mt-auto pb-12 sm:pb-16 lg:pb-20">
                <Diego />
              </div>
            </section>

            <AboutSection />
            <ReadmeSection />
          </div>
        </div>

        <SkillsSection />

        <footer className="py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Diego Pedroza
        </footer>
      </main>
    </Layout>
  );
}
