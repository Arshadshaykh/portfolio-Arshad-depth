const revealElements = document.querySelectorAll(".reveal");
const parallaxElements = document.querySelectorAll("[data-parallax]");
const tiltElement = document.querySelector("[data-tilt]");
const journey = document.querySelector(".depth-journey");
const sceneCards = journey ? Array.from(journey.querySelectorAll("[data-scene]")) : [];
const sceneLinks = Array.from(document.querySelectorAll("[data-scene-link]"));
const journeyProgress = document.querySelector(".journey-progress span");
const journeyCurrent = document.querySelector(".journey-current");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

if (tiltElement && !reduceMotion) {
  const resetTilt = () => {
    tiltElement.style.setProperty("--tilt-x", "0");
    tiltElement.style.setProperty("--tilt-y", "0");
  };

  tiltElement.addEventListener("pointermove", (event) => {
    const rect = tiltElement.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    const tiltX = (relativeX - 0.5) * 8;
    const tiltY = (0.5 - relativeY) * 8;

    tiltElement.style.setProperty("--tilt-x", tiltX.toFixed(2));
    tiltElement.style.setProperty("--tilt-y", tiltY.toFixed(2));
  });

  tiltElement.addEventListener("pointerleave", resetTilt);
}

const updateHeroParallax = () => {
  if (reduceMotion || !parallaxElements.length) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;
  const scrollY = window.scrollY;

  parallaxElements.forEach((element) => {
    const depth = Number(element.dataset.depth || 24);
    const mode = element.dataset.parallaxMode || "card";

    if (mode === "ambient") {
      const driftY = scrollY * (depth / 900);
      const driftX = scrollY * (depth / 5000);
      const rotate = scrollY * (depth / 60000);

      element.style.setProperty(
        "transform",
        `translate3d(${driftX.toFixed(2)}px, ${(-driftY).toFixed(2)}px, ${(-depth).toFixed(2)}px) rotate(${rotate.toFixed(2)}deg)`
      );
      return;
    }

    const rect = element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distanceFromCenter = (center - viewportCenter) / window.innerHeight;
    const clampedDistance = Math.max(-1.2, Math.min(1.2, distanceFromCenter));
    const translateY = clampedDistance * -depth * 0.9;
    const translateZ = (1 - Math.min(Math.abs(clampedDistance), 1)) * depth * 0.5;
    const rotateX = clampedDistance * -5 * (depth / 90);

    element.style.setProperty("--parallax-y", `${translateY.toFixed(2)}px`);
    element.style.setProperty("--parallax-z", `${translateZ.toFixed(2)}px`);
    element.style.setProperty("--parallax-rx", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--parallax-ry", "0deg");
  });
};

const updateJourneyScene = () => {
  if (!journey || !sceneCards.length) {
    return;
  }

  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth <= 560;
  const isTablet = viewportWidth <= 1040;
  const maxIndex = sceneCards.length - 1;
  const totalScrollable = Math.max(journey.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(
    1,
    Math.max(0, (window.scrollY - journey.offsetTop) / totalScrollable)
  );
  const scenePosition = progress * maxIndex;
  const activeIndex = Math.min(maxIndex, Math.round(scenePosition));

  if (journeyProgress) {
    journeyProgress.style.width = `${(progress * 100).toFixed(2)}%`;
  }

  if (journeyCurrent) {
    journeyCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
  }

  sceneCards.forEach((card, index) => {
    const distance = index - scenePosition;
    const absoluteDistance = Math.abs(distance);

    const xStep = isMobile ? 72 : isTablet ? 130 : 220;
    const yStep = isMobile ? 8 : 12;
    const zStep = isMobile ? 560 : isTablet ? 720 : 920;
    const zBase = isMobile ? 110 : isTablet ? 145 : 180;
    const rotateYStep = isMobile ? -10 : isTablet ? -16 : -24;
    const rotateXStep = isMobile ? 2.5 : isTablet ? 4 : 6;
    const scaleLoss = isMobile ? 0.08 : isTablet ? 0.12 : 0.16;
    const maxScaleLoss = isMobile ? 0.18 : isTablet ? 0.24 : 0.34;
    const blurStep = isMobile ? 4 : isTablet ? 6.5 : 10;

    let translateX = distance * xStep;
    let translateY = distance * yStep;
    let translateZ = -absoluteDistance * zStep + zBase;
    let rotateY = distance * rotateYStep;
    let rotateX = absoluteDistance * rotateXStep;
    let scale = 1 - Math.min(absoluteDistance * scaleLoss, maxScaleLoss);
    let opacity = Math.max(0, 1.15 - absoluteDistance * (isMobile ? 0.5 : 0.62));
    let blur = absoluteDistance * blurStep;

    if (absoluteDistance > 1.7) {
      opacity = 0;
      translateZ -= isMobile ? 120 : isTablet ? 220 : 320;
    }

    if (reduceMotion) {
      translateX = 0;
      translateY = 0;
      translateZ = 0;
      rotateY = 0;
      rotateX = 0;
      scale = 1;
      opacity = activeIndex === index ? 1 : 0;
      blur = 0;
    }

    card.style.setProperty("--scene-x", `${translateX.toFixed(2)}px`);
    card.style.setProperty("--scene-y", `${translateY.toFixed(2)}px`);
    card.style.setProperty("--scene-z", `${translateZ.toFixed(2)}px`);
    card.style.setProperty("--scene-rx", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--scene-ry", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--scene-scale", scale.toFixed(3));
    card.style.setProperty("--scene-opacity", opacity.toFixed(3));
    card.style.setProperty("--scene-blur", `${blur.toFixed(2)}px`);
    card.classList.toggle("is-active", activeIndex === index);
  });

  sceneLinks.forEach((link) => {
    link.classList.toggle(
      "is-current",
      Number(link.dataset.sceneLink) === activeIndex
    );
  });
};

let ticking = false;

const updateFrame = () => {
  updateHeroParallax();
  updateJourneyScene();
  ticking = false;
};

const requestFrame = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateFrame);
    ticking = true;
  }
};

requestFrame();
window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);

sceneLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const sceneIndex = Number(link.dataset.sceneLink);

    if (!journey || Number.isNaN(sceneIndex) || !sceneCards.length) {
      return;
    }

    event.preventDefault();

    const maxIndex = sceneCards.length - 1;
    const totalScrollable = Math.max(journey.offsetHeight - window.innerHeight, 1);
    const progress = maxIndex === 0 ? 0 : sceneIndex / maxIndex;
    const targetTop = journey.offsetTop + totalScrollable * progress + 1;

    window.scrollTo({
      top: targetTop,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
});
