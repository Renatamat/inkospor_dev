import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const initializedSections = new WeakSet<HTMLElement>();

const activateGoal = (section: HTMLElement, index: number): void => {
  section.dispatchEvent(
    new CustomEvent("homepage-goals:activate", {
      detail: { index },
    }),
  );
};

export const initHomepageGoalsScroll = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-goal-selector]").forEach((section) => {
    if (initializedSections.has(section)) return;

    const items = section.querySelectorAll<HTMLElement>("[data-goal-item]");
    const center = section.querySelector<HTMLElement>(".hp-cel-center");
    if (items.length < 2 || !center) return;

    initializedSections.add(section);

    const media = gsap.matchMedia();

    media.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      let activeIndex = -1;

      const setActiveFromProgress = (progress: number): void => {
        const nextIndex = Math.min(
          items.length - 1,
          Math.floor(progress * (items.length - 1)),
        );
        if (nextIndex === activeIndex) return;

        activeIndex = nextIndex;
        activateGoal(section, nextIndex);
      };

      const trigger = ScrollTrigger.create({
        trigger: center,
        start: "center center",
        end: () => `+=${(items.length - 1) * Math.max(240, window.innerHeight * 0.35)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => setActiveFromProgress(0),
        onEnterBack: (self) => setActiveFromProgress(self.progress),
        onUpdate: (self) => setActiveFromProgress(self.progress),
        onLeave: () => setActiveFromProgress(1),
        onLeaveBack: () => setActiveFromProgress(0),
      });

      return () => {
        trigger.kill();
        activeIndex = -1;
      };
    });
  });
};
