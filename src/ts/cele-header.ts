import gsap from "gsap";

const initializedImages = new WeakSet<HTMLImageElement>();

export const initCeleHeaderAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLImageElement>(".cl-header-photo img").forEach((image) => {
    if (initializedImages.has(image)) return;

    const section = image.closest<HTMLElement>(".cl-header");
    const badge = section?.querySelector<HTMLElement>(".cl-header-badge");
    const title = section?.querySelector<HTMLElement>(".cl-header-content h1");
    const description = section
      ?.querySelector<HTMLElement>(".cl-header-content p")
      ?.parentElement;
    const contentItems = [badge, title, description].filter(Boolean) as HTMLElement[];

    initializedImages.add(image);
    gsap.killTweensOf([image, ...contentItems]);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([image, ...contentItems], {
        clearProps: "transform,opacity,visibility,willChange",
      });
      return;
    }

    gsap.set(image, {
      autoAlpha: 0,
      x: 170,
      willChange: "transform,opacity",
    });
    gsap.set(contentItems, {
      opacity: 0,
      x: -60,
    });

    const play = (): void => {
      const timeline = gsap.timeline({
        delay: 0.12,
        onComplete: () => gsap.set([image, ...contentItems], { clearProps: "willChange" }),
      });

      timeline
        .to(image, {
          autoAlpha: 1,
          duration: 0.2,
          ease: "power1.out",
        }, 0)
        .to(image, {
          x: 0,
          duration: 1,
          ease: "power4.out",
        }, 0)
        .to(contentItems, {
          opacity: 1,
          x: 0,
          duration: 0.62,
          stagger: 0.08,
          ease: "power2.out",
        }, 0.42);
    };

    if (image.complete && image.naturalWidth > 0) {
      requestAnimationFrame(play);
      return;
    }

    image.addEventListener("load", play, { once: true });
  });
};
