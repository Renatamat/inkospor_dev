import gsap from "gsap";

const initializedSections = new WeakSet<HTMLElement>();

export const initProductHeaderAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".pr-header").forEach((section) => {
    if (initializedSections.has(section)) return;

    const image = section.querySelector<HTMLImageElement>(".pr-header-image img");
    const copy = section.querySelector<HTMLElement>("[data-product-header-copy]");
    const textItems = copy
      ? Array.from(copy.querySelectorAll<HTMLElement>(":scope > span, :scope > h1"))
      : [];

    if (!image || !textItems.length) return;

    initializedSections.add(section);
    gsap.killTweensOf([image, ...textItems]);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([image, ...textItems], {
        clearProps: "transform,opacity,visibility,willChange",
      });
      return;
    }

    gsap.set(image, {
      autoAlpha: 0,
      y: 48,
      scale: 0.78,
      transformOrigin: "50% 65%",
      willChange: "transform,opacity",
    });
    gsap.set(textItems, {
      opacity: 0,
      x: -60,
    });

    let hasPlayed = false;
    const play = (): void => {
      if (hasPlayed) return;
      hasPlayed = true;

      const timeline = gsap.timeline({
        delay: 0.12,
        onComplete: () => {
          gsap.set([image, ...textItems], { clearProps: "willChange" });
        },
      });

      timeline
        .to(image, {
          autoAlpha: 1,
          duration: 0.18,
          ease: "power1.out",
        }, 0)
        .to(image, {
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power4.out",
        }, 0)
        .to(textItems, {
          opacity: 1,
          x: 0,
          duration: 0.58,
          stagger: 0.1,
          ease: "power3.out",
        }, 0.18);
    };

    if (image.complete && image.naturalWidth > 0) {
      requestAnimationFrame(play);
      return;
    }

    image.addEventListener("load", play, { once: true });
    image.addEventListener("error", play, { once: true });
  });
};
