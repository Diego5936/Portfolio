import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import readmeTopBar from "@/assets/readme-top-bar.jpg";
import readme from "virtual:readme";

export function ReadmeSection() {
  return (
    <section id="readme" className="portfolio-readme-section scroll-mt-14 pb-14 sm:scroll-mt-16 sm:pb-0">
      <div className="portfolio-readme-window overflow-hidden rounded-2xl border">
        <img
          src={readmeTopBar}
          alt=""
          aria-hidden="true"
          className="block w-full"
        />

        <div className="portfolio-readme p-6 sm:p-10 sm:pt-8">
          <h2 className="sr-only">README</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
