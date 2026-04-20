import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";

export default function Experience() {
  return (
    <>
      <Header />
      <Layout>
        <main>
          <ExperienceSection />
          <footer className="py-10 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Diego Pedroza
          </footer>
        </main>
      </Layout>
    </>
  );
}
