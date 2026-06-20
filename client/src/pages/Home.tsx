import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { DiffusionPanel, HeroIntro } from "@/components/home/Diffusion";
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
    <>
      <Header />
      <Layout>
        <main>
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <aside
              className="relative hidden lg:block"
              aria-label="Portrait and diffusion panel"
            >
              <div className="sticky top-16 pt-14 sm:top-16 sm:pt-20">
                <DiffusionPanel />
              </div>
            </aside>

            <div className="min-w-0">
              <section
                id="home"
                className="scroll-mt-14 py-14 sm:scroll-mt-16 sm:py-20 lg:pb-0"
              >
                <div className="mb-10 lg:hidden">
                  <DiffusionPanel />
                </div>
                <HeroIntro />
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
    </>
  );
}
