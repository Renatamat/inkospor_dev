import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

type DropPath = {
  delay: number;
  startX: number;
  stopX: number;
  endX: number;
  rotation: number;
  duration: number;
  drift: number[];
};

const paths: DropPath[] = [
  {
    delay: 0,
    startX: 0,
    stopX: 2,
    endX: 1,
    rotation: 3,
    duration: 1.35,
    drift: [4, -2, 3],
  },
  {
    delay: 0.34,
    startX: 0,
    stopX: -1,
    endX: 1,
    rotation: -3,
    duration: 1.75,
    drift: [-3, 2, -1],
  },
  {
    delay: 0.68,
    startX: 0,
    stopX: 1,
    endX: 0,
    rotation: 2,
    duration: 2.15,
    drift: [2, -2, 1],
  },
];

const createDropTimeline = (
  drop: HTMLElement,
  section: HTMLElement,
  path: DropPath,
): void => {
  gsap.set(drop, {
    autoAlpha: 0,
    x: path.startX,
    y: -160,
    rotation: path.rotation - 6,
    scaleX: 0.62,
    scaleY: 1.28,
    transformOrigin: "50% 20%",
  });

  const timeline = gsap.timeline({
    delay: path.delay,
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      once: true,
    },
  });

  timeline
    .to(drop, {
      autoAlpha: 1,
      duration: 0.18,
      ease: "power1.out",
    })
    .to(drop, {
      x: path.stopX,
      y: -16,
      rotation: path.rotation - 2,
      scaleX: 1.08,
      scaleY: 0.92,
      duration: 0.72,
      ease: "power2.out",
    }, "<")
    .to({}, { duration: 0.09 })
    .addLabel("flow")
    .to(drop, {
      y: 770,
      duration: path.duration,
      ease: "power2.in",
    }, "flow")
    .to(drop, {
      autoAlpha: 0,
      duration: 0.4,
      ease: "power1.out",
    }, `flow+=${path.duration - 0.12}`);

  timeline
    .to(drop, {
      x: path.stopX + path.drift[0],
      duration: path.duration * 0.28,
      ease: "sine.inOut",
    }, "flow")
    .to(drop, {
      x: path.stopX + path.drift[1],
      duration: path.duration * 0.34,
      ease: "sine.inOut",
    }, `flow+=${path.duration * 0.28}`)
    .to(drop, {
      x: path.endX + path.drift[2],
      duration: path.duration * 0.38,
      ease: "sine.inOut",
    }, `flow+=${path.duration * 0.62}`);

  timeline
    .to(drop, {
      scaleX: 0.68,
      scaleY: 1.38,
      rotation: path.rotation,
      duration: 0.18,
      ease: "power2.out",
    }, "flow")
    .to(drop, {
      scaleX: 0.92,
      scaleY: 1.08,
      rotation: path.rotation * -0.4,
      duration: 0.3,
      ease: "sine.inOut",
    }, "flow+=0.18")
    .to(drop, {
      scaleX: 0.78,
      scaleY: 1.24,
      rotation: path.rotation * 0.65,
      duration: 0.32,
      ease: "sine.inOut",
    }, "flow+=0.48")
    .to(drop, {
      scaleX: 0.86,
      scaleY: 1.16,
      rotation: path.rotation,
      duration: Math.max(0.2, path.duration - 0.8),
      ease: "sine.out",
    }, "flow+=0.8");
};

export const initHomepageIngredientsWater = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-water-flow-section]").forEach((section) => {
    if (initializedSections.has(section)) return;

    const drops = Array.from(
      section.querySelectorAll<HTMLElement>("[data-water-flow]"),
    );
    if (!drops.length) return;

    initializedSections.add(section);
    gsap.killTweensOf(drops);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(drops, { autoAlpha: 1, clearProps: "transform" });
      return;
    }

    drops.forEach((drop, index) => {
      createDropTimeline(drop, section, paths[index % paths.length]);
    });
  });
};
