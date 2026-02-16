import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";

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
  return (
    <>
      <Header />
      <Layout>
        <main>
          <Hero />

          <SectionStub id="projects" title="Projects" />
          <SectionStub id="skills" title="Skills" />
          <SectionStub id="resume" title="Resume" />
          <SectionStub id="about" title="About" />

          <footer className="py-10 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Diego Pedroza
          </footer>
        </main>
      </Layout>
    </>
  );
}
