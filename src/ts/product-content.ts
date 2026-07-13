import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const initializedBlocks = new WeakSet<HTMLElement>();
let areTabEventsReady = false;

const initTextImageBlock = (block: HTMLElement): void => {
  const text = block.querySelector<HTMLElement>(".pr-content-text");
  const image = block.querySelector<HTMLImageElement>("img");
  if (!text || !image) return;

  const blockRect = block.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  const imageIsOnLeft = imageRect.left + imageRect.width / 2 < blockRect.left + blockRect.width / 2;
  const imageStartX = imageIsOnLeft ? -70 : 70;
  const textStartX = imageIsOnLeft ? 45 : -45;
  const elements = [text, image];

  gsap.killTweensOf(elements);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(elements, {
      opacity: 1,
      clearProps: "transform,opacity,visibility",
    });
    return;
  }

  gsap.set(text, { opacity: 0, x: textStartX });
  gsap.set(image, { opacity: 0, x: imageStartX, scale: 0.9 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: block,
      start: "top 58%",
      once: true,
    },
    onComplete: () => {
      gsap.set(elements, { clearProps: "transform,opacity,visibility" });
    },
  });

  timeline
    .to(text, {
      opacity: 1,
      x: 0,
      duration: 0.65,
      ease: "power3.out",
    }, 0)
    .to(image, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.78,
      ease: "power3.out",
    }, 0.08);
};

const initBlock = (block: HTMLElement): void => {
  if (initializedBlocks.has(block)) return;

  const panel = block.closest<HTMLElement>(".tab-pane");
  if (panel && !panel.classList.contains("active")) return;

  initializedBlocks.add(block);

  if (block.classList.contains("pr-content-blok-textimage")) {
    initTextImageBlock(block);
    return;
  }

  gsap.killTweensOf(block);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(block, {
      opacity: 1,
      clearProps: "transform,opacity,visibility",
    });
    return;
  }

  gsap.fromTo(block, {
    opacity: 0,
    x: -60,
  }, {
    opacity: 1,
    x: 0,
    duration: 0.68,
    ease: "power3.out",
    scrollTrigger: {
      trigger: block,
      start: "top 58%",
      once: true,
    },
    onComplete: () => {
      gsap.set(block, { clearProps: "transform,opacity,visibility" });
    },
  });
};

const initBlocksWithin = (root: ParentNode): void => {
  root.querySelectorAll<HTMLElement>(
    ".pr-content-blok-text, .pr-content-blok-textimage",
  ).forEach(initBlock);
};

export const initProductContentAnimations = (root: ParentNode = document): void => {
  initBlocksWithin(root);

  if (areTabEventsReady || typeof document === "undefined") return;
  areTabEventsReady = true;

  document.addEventListener("shown.bs.tab", (event) => {
    const trigger = event.target as HTMLElement | null;
    const targetSelector = trigger?.getAttribute("data-bs-target");
    if (!targetSelector) return;

    const panel = document.querySelector<HTMLElement>(targetSelector);
    if (!panel) return;

    initBlocksWithin(panel);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
};
