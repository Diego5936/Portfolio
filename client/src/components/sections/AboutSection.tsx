import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const aboutSections = [
  {
    heading: "About Me",
    paragraphs: [
      "My name is Diego Pedroza, and I am a senior at the **University of Central Florida** studying **Computer Science** with a minor in **Intelligent Robotic Systems**. I am also a brother of **Theta Tau**, the oldest co-ed engineering fraternity in the U.S.",
      "Professionally, I am currently doing autonomous navigation robotics research with the **UCF Institute of Artificial Intelligence**. I have also worked as a Neural Systems Intern for **Pheratech Systems**, where I created test simulations and worked on core navigation logic for drone swarms designed for search and rescue applications.",
    ],
  },
  {
    heading: "My Path",
    paragraphs: [
      "I have wanted to work in robotics since I was a kid. Phineas and Ferb heavily inspired my love for engineering, and after watching Big Hero 6, I knew I also wanted a Baymax. I am grateful that I have gotten to work on teams that let me chase that dream and that my niche has become simulations and robotic experiments. When I finally got my hands on a device strong enough to run **NVIDIA Isaac Sim**, you best believe I made some silly **reinforcement learning** simulations of agents playing tag and soccer.",
      "I have also really enjoyed the research side of my field. The **scientific process** is appealing to me because it turns **failure into part of the plan**. You find a complex problem, brainstorm a way to tackle it, try it, watch it fail miserably, revise, and try again. That cycle of expected adaptation is one of the most interesting parts of research to me. Being surrounded by PhD students has opened my eyes to the path of academic research and its appeal. I still don't know whether I want to pursue a PhD, but as I continue toward graduate research, I am excited to find out which **questions are worth chasing**.",
    ],
  },
  {
    heading: "Interests",
    paragraphs: [
      "I love being an active person. I did track and field in high school, specializing in the **400-meter hurdles**. As I result, it taught me to enjoy pushing the limits of my own mind and body. Although I am no longer subjecting myself to insanely rigorous training, I still enjoy challenging myself. I have completed a **Spartan Beast**, a half-marathon obstacle-course race, and I plan to do an **Ironman** in the future.",
      "I have a cat! Her name is **Nala**, and she is very cute and friendly. Before having Nala, I fostered an abandoned cat that I named Nana (short for Guanábana). After Nana found her forever home, the house felt empty, so here came little queen Nala, named after the lioness queen from The Lion King, to bring more joy!",
      "I also love the outdoors. Camping and hiking are the best, especially after spending too much time staring at a screen. As soon as I started college, I started rock climbing and quickly got hooked. You can also find me at the springs or natural reserves **slacklining**, **paddleboarding**, and exploring my local sorroundings whenever I get a chance.",
    ],
  },
] as const;

type AboutSectionData = (typeof aboutSections)[number];

const aboutSectionIds: Record<AboutSectionData["heading"], string> = {
  "About Me": "about-me",
  "My Path": "about-my-path",
  Interests: "about-interests",
};

function renderAboutParagraph(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={`${index}-${part}`} className="portfolio-about-highlight">
          {part.slice(2, -2)}
        </span>
      );
    }

    return part;
  });
}

function useRevealOnScroll(resetKey: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [resetKey]);

  return { ref, visible };
}

function AboutSectionBlock({
  section,
  resetKey,
}: {
  section: AboutSectionData;
  resetKey: number;
}) {
  const { ref, visible } = useRevealOnScroll(resetKey);

  return (
    <div
      id={aboutSectionIds[section.heading]}
      ref={ref}
      className={cn(
        "portfolio-about-section-block portfolio-about-reveal",
        visible && "is-visible",
      )}
    >
      <h3 className="portfolio-about-section-title">{section.heading}</h3>
      <div className="portfolio-about-body space-y-3">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{renderAboutParagraph(paragraph)}</p>
        ))}
      </div>
    </div>
  );
}

export const PORTFOLIO_HOME_RESET_EVENT = "portfolio-home-reset";

const ABOUT_REVEAL_TOP_THRESHOLD_PX = 48;

export function AboutSection() {
  const [revealKey, setRevealKey] = useState(0);
  const wasScrolledBelowTopRef = useRef(false);

  useEffect(() => {
    const resetReveals = () => {
      setRevealKey((key) => key + 1);
      wasScrolledBelowTopRef.current = false;
    };

    const handleScroll = () => {
      const atTop = window.scrollY <= ABOUT_REVEAL_TOP_THRESHOLD_PX;

      if (atTop) {
        if (wasScrolledBelowTopRef.current) {
          resetReveals();
        }
        return;
      }

      wasScrolledBelowTopRef.current = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener(PORTFOLIO_HOME_RESET_EVENT, resetReveals);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(PORTFOLIO_HOME_RESET_EVENT, resetReveals);
    };
  }, []);

  return (
    <section
      id="about"
      className="portfolio-about-section scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="portfolio-about-sections">
        {aboutSections.map((section) => (
          <AboutSectionBlock
            key={section.heading}
            section={section}
            resetKey={revealKey}
          />
        ))}
      </div>
    </section>
  );
}
