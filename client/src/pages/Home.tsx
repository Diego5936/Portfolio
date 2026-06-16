import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { Diffusion } from "@/components/home/Diffusion";
import { SkillsSection } from "@/components/sections/SkillsSection";

function SectionStub({ id, title }: { id: string; title: string }) {
  return (
    <section id={id} className="py-14 sm:py-20">
      <div className="rounded-2xl border bg-card p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          Placeholder
        </p>
      </div>
    </section>
  );
}

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
          <Diffusion />
          <SectionStub id="about" title="About" />
          <SkillsSection />

          <footer className="py-10 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Diego Pedroza
          </footer>
        </main>
      </Layout>
    </>
  );
}
