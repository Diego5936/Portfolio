const aboutParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris viverra veniam sit amet lacus cursus, non feugiat tellus tincidunt. Phasellus ac arcu at odio volutpat tempus.",
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-14 pb-14 pt-8 sm:scroll-mt-16 sm:pb-13 sm:pt-10">
      <div className="min-h-[28rem] rounded-2xl border bg-card p-6 sm:min-h-[36rem] sm:p-10">
        <h2 className="portfolio-section-title">About Me</h2>

        <div className="portfolio-detail-body mt-6 space-y-5">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
