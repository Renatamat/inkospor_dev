import gsap from "gsap";

const initializedCategoryBars = new WeakSet<HTMLElement>();
const initializedCardRows = new WeakSet<HTMLElement>();

const groupCardsByVisualRow = (cards: HTMLElement[]): HTMLElement[][] => {
  const rows = new Map<number, HTMLElement[]>();

  cards.forEach((card) => {
    const top = Math.round(card.offsetTop);
    const row = rows.get(top) || [];

    row.push(card);
    rows.set(top, row);
  });

  return Array.from(rows.entries())
    .sort(([firstTop], [secondTop]) => firstTop - secondTop)
    .map(([, row]) => row);
};

export const initBlogListingAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".bl-listing-category-bar").forEach((bar) => {
    if (initializedCategoryBars.has(bar)) return;

    const pills = Array.from(
      bar.querySelectorAll<HTMLElement>(".bl-listing-category-pill"),
    );
    if (!pills.length) return;

    initializedCategoryBars.add(bar);
    gsap.killTweensOf(pills);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(pills, { clearProps: "transform,opacity,visibility" });
      return;
    }

    gsap.fromTo(pills, {
      opacity: 0,
      y: 24,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.48,
      ease: "power2.out",
      stagger: 0.06,
      scrollTrigger: {
        trigger: bar,
        start: "top 76%",
        once: true,
      },
    });
  });

  root.querySelectorAll<HTMLElement>(".bl-listing .row.r-gap-24").forEach((row) => {
    if (initializedCardRows.has(row)) return;

    const cards = Array.from(
      row.querySelectorAll<HTMLElement>(":scope > [class*='col-']"),
    );
    if (!cards.length) return;

    initializedCardRows.add(row);
    gsap.killTweensOf(cards);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.set(cards, {
      autoAlpha: 0,
      y: 56,
      scale: 0.96,
      filter: "blur(8px)",
    });

    groupCardsByVisualRow(cards).forEach((cardRow) => {
      gsap.to(cardRow, {
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
          trigger: cardRow[0],
          start: "top 72%",
          once: true,
        },
        onComplete: () => {
          gsap.set(cardRow, {
            clearProps: "transform,filter,opacity,visibility",
          });
        },
      });
    });
  });
};
