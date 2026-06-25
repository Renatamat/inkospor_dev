import gsap from "gsap";

const hoverReadyCards = new WeakSet<HTMLElement>();

const initCertCardHover = (cards: HTMLElement[]): void => {
  cards.forEach((card) => {
    if (hoverReadyCards.has(card)) return;

    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -12,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    hoverReadyCards.add(card);
  });
};

export const initHomepageCertAnimations = (root: ParentNode = document): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-cert-stagger]").forEach((container) => {
    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-cert-card]"),
    );
    if (!cards.length) return;

    gsap.killTweensOf(cards);
    initCertCardHover(cards);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, { opacity: 1, clearProps: "transform,filter" });
      return;
    }

    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 56,
        scale: 0.96,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
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
          start: "top 78%",
          once: true,
        },
        onComplete: () => {
          gsap.set(cards, { clearProps: "transform,filter" });
        },
      },
    );
  });
};
