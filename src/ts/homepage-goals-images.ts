import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

type VisualChangeDetail = {
  target?: string;
};

export const initHomepageGoalsImages = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-goal-selector]").forEach((section) => {
    if (initializedSections.has(section)) return;

    const visualContainer = section.querySelector<HTMLElement>(".hp-cel-images");
    const visuals = Array.from(
      section.querySelectorAll<HTMLImageElement>("[data-goal-visual]"),
    );
    if (!visualContainer || !visuals.length) return;

    initializedSections.add(section);

    let currentTarget = visuals.find((visual) => !visual.hidden)?.dataset.goalVisual || "1";
    let requestedTarget = currentTarget;
    let transition: gsap.core.Timeline | null = null;
    const shouldAnimate = (): boolean =>
      window.matchMedia("(min-width: 992px) and (prefers-reduced-motion: no-preference)").matches;

    const showVisual = (target: string): void => {
      visuals.forEach((visual) => {
        visual.hidden = visual.dataset.goalVisual !== target;
      });
      currentTarget = target;
    };

    section.addEventListener("homepage-goals:visual-change", ((event: Event) => {
      const { target } = (event as CustomEvent<VisualChangeDetail>).detail || {};
      if (!target || target === requestedTarget) return;

      requestedTarget = target;

      transition?.kill();
      transition = null;
      gsap.killTweensOf(visualContainer);
      gsap.set(visualContainer, {
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px)",
      });

      if (target === currentTarget) return;

      if (!shouldAnimate()) {
        showVisual(target);
        return;
      }

      transition = gsap.timeline({
        onComplete: () => {
          transition = null;
          gsap.set(visualContainer, { clearProps: "transform,filter,opacity,visibility" });
        },
      })
        .to(visualContainer, {
          autoAlpha: 0,
          scale: 0.985,
          filter: "blur(3px)",
          duration: 0.16,
          ease: "power2.in",
        })
        .call(() => showVisual(target))
        .fromTo(visualContainer, {
          autoAlpha: 0,
          scale: 1.015,
          filter: "blur(3px)",
        }, {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.24,
          ease: "power2.out",
        });
    }) as EventListener);
  });
};
