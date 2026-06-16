import { Github, Linkedin, FileText } from "lucide-react";

const nav = [
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Skills", href: "/#skills" },
] as const;

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) {
    return false;
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  return true;
}

function handleNavClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  const url = new URL(href, window.location.origin);
  const sectionId = url.hash.replace("#", "");

  if (!sectionId) {
    return;
  }

  event.preventDefault();

  if (window.location.pathname !== url.pathname) {
    window.location.assign(`${url.pathname}#${sectionId}`);
    return;
  }

  scrollToSection(sectionId);
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[min(100%,85rem)] items-center justify-between px-3 sm:px-4 lg:px-5">
        <a href="/" className="font-semibold tracking-tight">
          dpedroza
          <span className="text-muted-foreground">.dev</span>
        </a>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavClick(event, item.href)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Networking Icons */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Diego5936"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition hover:text-foreground"
          >
            <Github size={18} />
          </a>

          <a
            href="https://linkedin.com/in/diegopedrozap/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition hover:text-foreground"
          >
            <Linkedin size={18} />
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition hover:text-foreground"
          >
            <FileText size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
