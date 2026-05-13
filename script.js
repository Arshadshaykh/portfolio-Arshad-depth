const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealTargets = [
  ".hero-copy",
  ".outcome-panel",
  ".stats-band > div",
  ".section-heading",
  ".timeline-item",
  ".project-card",
  ".skill-group",
  ".education-grid article",
  ".final-cta",
  ".site-footer",
].join(",");

const elements = Array.from(document.querySelectorAll(revealTargets));

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  elements.forEach((element) => element.classList.add("is-visible"));
} else {
  elements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.14,
    }
  );

  elements.forEach((element) => observer.observe(element));
}
