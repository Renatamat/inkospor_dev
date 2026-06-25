import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

const groupCardsByRows = (cards: HTMLElement[]): HTMLElement[][] => {
  const rows: HTMLElement[][] = [];
  const tolerance = 8;

  cards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    const existingRow = rows.find((row) => {
      const rowTop = row[0]?.getBoundingClientRect().top ?? top;
      return Math.abs(rowTop - top) <= tolerance;
    });

    if (existingRow) {
      existingRow.push(card);
      return;
    }

    rows.push([card]);
  });

  return rows;
};

const getExpertsScrollStart = (): string => (
  window.matchMedia("(min-width: 1921px)").matches ? "top 52%" : "top 32%"
);

export const initHomepageExpertsAnimations = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>(".hp-eksperci").forEach((section) => {
    if (initializedSections.has(section)) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".hp-eksperci-card"),
    );
    if (!cards.length) return;

    initializedSections.add(section);
    const cardRows = groupCardsByRows(cards);

    const getCardItems = (card: HTMLElement) => {
      const image = card.querySelector<HTMLElement>(".hp-eksperci-card-image-front");
      const content = card.querySelector<HTMLElement>(
        ".hp-eksperci-card-image + .d-flex",
      );
      const name = content?.querySelector<HTMLElement>(".d-flex") ?? null;
      const description = content?.querySelector<HTMLElement>("p") ?? null;
      const button = content?.querySelector<HTMLElement>("a") ?? null;

      return {
        image,
        textItems: [name, description, button].filter(
          (item): item is HTMLElement => Boolean(item),
        ),
      };
    };

    const animatedItems = cards.flatMap((card) => {
      const { image, textItems } = getCardItems(card);
      return [image, ...textItems].filter(
        (item): item is HTMLElement => Boolean(item),
      ); 
    });

    gsap.killTweensOf(animatedItems);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(animatedItems, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.set(animatedItems, { autoAlpha: 0 });

    cards.forEach((card) => {
      const { image, textItems } = getCardItems(card);

      if (image) {
        gsap.set(image, {
          y: 36,
          scale: 1.16,
          rotate: -2,
          filter: "blur(10px)",
          transformOrigin: "50% 80%",
        });
      }

      gsap.set(textItems, {
        x: -42,
        filter: "blur(6px)",
      });
    });

    const addCardSequence = (
      timeline: gsap.core.Timeline,
      card: HTMLElement,
      position: gsap.Position = 0,
    ) => {
      const { image, textItems } = getCardItems(card);

      if (image) {
        timeline.to(image, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
          duration: 0.42,
          ease: "back.out(1.35)",
        }, position);
      }

      timeline.to(textItems, {
        autoAlpha: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.24,
        ease: "power3.out",
        stagger: 0.08,
      }, image ? "-=0.18" : position);
    };

    cardRows.forEach((row) => {
      const rowItems = row.flatMap((card) => {
        const { image, textItems } = getCardItems(card);
        return [image, ...textItems].filter(
          (item): item is HTMLElement => Boolean(item),
        );
      });

      const rowTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: row[0],
          start: getExpertsScrollStart,
          once: true,
        },
        onComplete: () => {
          gsap.set(rowItems, {
            clearProps: "transform,filter,opacity,visibility",
          });
        },
      });

      row.forEach((card, index) => {
        addCardSequence(rowTimeline, card, index * 0.1);
      });
    });
  });
};
