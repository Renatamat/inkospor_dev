import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

export const initHomepageGmpAnimations = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-gmp-animate]").forEach((section) => {
    if (initializedSections.has(section)) return;

    const logo = section.querySelector<HTMLElement>("[data-gmp-logo]");
    const title = section.querySelector<HTMLElement>("[data-gmp-title]");
    const copy = section.querySelector<HTMLElement>("[data-gmp-copy]");
    const points = Array.from(
      section.querySelectorAll<HTMLElement>("[data-gmp-point]"),
    );
    if (!logo || !title || !copy || !points.length) return;

    initializedSections.add(section);
    const elements = [logo, title, copy, ...points];
    gsap.killTweensOf(elements);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(elements, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.set(logo, {
      autoAlpha: 0,
      y: 24,
      scale: 0.68,
      rotation: -7,
      filter: "blur(8px)",
      transformOrigin: "50% 50%",
    });
    gsap.set(title, {
      autoAlpha: 0,
      y: 52,
      scale: 0.94,
      filter: "blur(7px)",
      transformOrigin: "0% 50%",
    });
    gsap.set(copy, {
      autoAlpha: 0,
      y: 34,
      filter: "blur(5px)",
    });
    gsap.set(points, {
      autoAlpha: 0,
      x: -14,
      y: 28,
      filter: "blur(4px)",
    });

    gsap.to(logo, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotation: 0,
      filter: "blur(0px)",
      duration: 0.68,
      ease: "back.out(1.45)",
      scrollTrigger: {
        trigger: logo,
        start: "top 84%",
        once: true,
      },
      onComplete: () => {
        gsap.set(logo, { clearProps: "transform,filter,opacity,visibility" });
      },
    });

    gsap.to(title, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.64,
      ease: "power3.out",
      scrollTrigger: {
        trigger: title,
        start: "top 84%",
        once: true,
      },
      onComplete: () => {
        gsap.set(title, { clearProps: "transform,filter,opacity,visibility" });
      },
    });

    gsap.to(copy, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.58,
      ease: "power3.out",
      scrollTrigger: {
        trigger: copy,
        start: "top 84%",
        once: true,
      },
      onComplete: () => {
        gsap.set(copy, { clearProps: "transform,filter,opacity,visibility" });
      },
    });

    points.forEach((point) => {
      gsap.to(point, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        duration: 0.48,
        ease: "power3.out",
        scrollTrigger: {
          trigger: point,
          start: "top 84%",
          once: true,
        },
        onComplete: () => {
          gsap.set(point, { clearProps: "transform,filter,opacity,visibility" });
        },
      });
    });
  });
};
