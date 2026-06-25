import gsap from "gsap";

const initializedVideos = new WeakSet<HTMLElement>();

export const initHomepageMigAnimations = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>(".hp-mig-video").forEach((video) => {
    if (initializedVideos.has(video)) return;

    const image = video.querySelector<HTMLElement>("img");

    initializedVideos.add(video);
    gsap.killTweensOf([video, image]);

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || window.matchMedia("(max-width: 991.98px)").matches
    ) {
      gsap.set([video, image], {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.set(video, {
      autoAlpha: 0.72,
      y: 72,
      scale: 0.82,
      filter: "blur(4px)",
      transformOrigin: "50% 50%",
    });

    if (image) {
      gsap.set(image, {
        scale: 1.12,
        transformOrigin: "50% 50%",
      });
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: video,
        start: "top 88%",
        end: "top 48%",
        scrub: 0.55,
      },
    });

    timeline.to(video, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      ease: "none",
    }, 0);

    if (image) {
      timeline.to(image, {
        scale: 1,
        ease: "none",
      }, 0);
    }
  });
};
