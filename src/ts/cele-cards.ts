import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

export const initCeleCardsAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".cl-cele-container").forEach((container) => {
    if (initializedSections.has(container)) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>(".cl-cele-item"),
    );
    if (!cards.length) return;

    initializedSections.add(container);
    gsap.killTweensOf(cards);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.fromTo(cards, {
      autoAlpha: 0,
      y: 56,
      scale: 0.96,
      filter: "blur(8px)",
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.72,
      ease: "power3.out",
      stagger: {
        each: 0.12,
        from: "start",
      },
      scrollTrigger: {
        trigger: container,
        start: "top 70%",
        once: true,
      },
      onComplete: () => {
        gsap.set(cards, {
          clearProps: "transform,filter,opacity,visibility",
        });
      },
    });
  });
};
