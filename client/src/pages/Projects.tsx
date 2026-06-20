import { Layout } from "@/components/layout/Layout";
import { ProjectsSection } from "@/components/sections/ProjectsSection";

export default function Projects() {
  return (
    <Layout>
      <main>
        <ProjectsSection />
        <footer className="py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Diego Pedroza
        </footer>
      </main>
    </Layout>
  );
}
