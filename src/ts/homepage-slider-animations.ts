import gsap from "gsap";

type SliderAnimationEvent = CustomEvent<{
  el: HTMLElement;
  type: "init" | "slide-change";
  speed: number;
}>;

const delayedSliderAnimations = new WeakMap<HTMLElement, gsap.core.Tween>();
let areSliderAnimationListenersReady = false;

const runActiveSlideAnimation = (el: HTMLElement): void => {
  if (!el.hasAttribute("data-animate-active-slide")) return;

  const animatedItems = Array.from(
    el.querySelectorAll<HTMLElement>("[data-slide-animate]"),
  );
  gsap.killTweensOf(animatedItems);
  gsap.set(animatedItems, {
    opacity: 0,
    clearProps: "filter,transform",
  });

  const activeSlide = el.querySelector<HTMLElement>(".swiper-slide-active");
  if (!activeSlide) return;

  const activeItems = Array.from(
    activeSlide.querySelectorAll<HTMLElement>("[data-slide-animate]"),
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(activeItems, {
      opacity: 1,
      clearProps: "filter,transform",
    });
    return;
  }

  const title = activeSlide.querySelector<HTMLElement>(
    '[data-slide-animate="zoom-boom"]',
  );
  const lead = activeSlide.querySelector<HTMLElement>(
    '[data-slide-animate="scale-boom"]',
  );

  const timeline = gsap.timeline();

  if (title) {
    timeline.set(
      title,
      {
        opacity: 0,
        scale: 1.58,
        z: 180,
        filter: "blur(12px)",
        transformPerspective: 1200,
      },
      0,
    );
    timeline.to(
      title,
      {
        scale: 0.94,
        z: 0,
        filter: "blur(0px)",
        duration: 0.32,
        ease: "power4.out",
      },
      0,
    );
    timeline.to(
      title,
      {
        opacity: 1,
        duration: 0.12,
        ease: "power2.out",
      },
      0,
    );
    timeline.to(title, {
      scale: 1.055,
      duration: 0.16,
      ease: "power2.out",
    });
    timeline.to(title, {
      scale: 0.988,
      duration: 0.12,
      ease: "power2.inOut",
    });
    timeline.to(title, {
      scale: 1,
      duration: 0.16,
      ease: "power2.out",
    });
  }

  if (lead) {
    timeline.fromTo(
      lead,
      {
        opacity: 0,
        scale: 0.72,
        z: -100,
        filter: "blur(8px)",
        transformPerspective: 1200,
      },
      {
        opacity: 1,
        scale: 1,
        z: 0,
        filter: "blur(0px)",
        duration: 0.58,
        ease: "power3.out",
      },
      0.26,
    );
  }
};

const scheduleActiveSlideAnimation = (
  el: HTMLElement,
  type: "init" | "slide-change",
  speed = 0,
): void => {
  const delay = type === "init" ? 0.18 : Math.max(0, speed - 220) / 1000;

  delayedSliderAnimations.get(el)?.kill();
  delayedSliderAnimations.set(
    el,
    gsap.delayedCall(delay, () => runActiveSlideAnimation(el)),
  );
};

const handleSliderAnimationEvent = (event: Event): void => {
  const { el, type, speed } = (event as SliderAnimationEvent).detail;
  if (!el) return;

  scheduleActiveSlideAnimation(el, type, speed);
};

export const initHomepageSliderAnimations = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  if (!areSliderAnimationListenersReady) {
    window.addEventListener(
      "homepage-slider:active-slide-animation",
      handleSliderAnimationEvent,
    );
    areSliderAnimationListenersReady = true;
  }

  root
    .querySelectorAll<HTMLElement>("[data-animate-active-slide]")
    .forEach((el) => {
      scheduleActiveSlideAnimation(el, "init");
    });
};
