import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { Layout } from "@/components/layout/Layout";

export default function Experience() {
  return (
    <Layout>
      <main>
        <ExperienceSection />
        <footer className="py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Diego Pedroza
        </footer>
      </main>
    </Layout>
  );
}
