import gsap from "gsap";

const initializedImages = new WeakSet<HTMLElement>();
const initializedSliders = new WeakSet<HTMLElement>();

export const initHomepageProdAnimations = (
  root: ParentNode = document,
): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-prod-top-zoom]").forEach((image) => {
    if (initializedImages.has(image)) return;

    initializedImages.add(image);
    gsap.killTweensOf(image);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(image, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.set(image, {
      autoAlpha: 0,
      scale: 1.58,
      z: 180,
      filter: "blur(12px)",
      transformPerspective: 1200,
      transformOrigin: "50% 50%",
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: image,
        start: "top 68%",
        once: true,
      },
      onComplete: () => {
        gsap.set(image, {
          clearProps: "transform,filter,opacity,visibility",
        });
      },
    });

    timeline
      .to(image, {
        autoAlpha: 1,
        duration: 0.17,
        ease: "power2.out",
      })
      .to(image, {
        scale: 0.94,
        z: 0,
        filter: "blur(0px)",
        duration: 0.46,
        ease: "power4.out",
      }, 0)
      .to(image, {
        scale: 1.055,
        duration: 0.22,
        ease: "power2.out",
      })
      .to(image, {
        scale: 0.988,
        duration: 0.17,
        ease: "power2.inOut",
      })
      .to(image, {
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
      });
  });

  root.querySelectorAll<HTMLElement>("[data-prod-stagger]").forEach((slider) => {
    if (initializedSliders.has(slider)) return;

    const cards = Array.from(
      slider.querySelectorAll<HTMLElement>(".hp-prod-item"),
    );
    if (!cards.length) return;

    initializedSliders.add(slider);
    gsap.killTweensOf(cards);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, {
        autoAlpha: 1,
        clearProps: "transform,filter,opacity,visibility",
      });
      return;
    }

    gsap.fromTo(cards, {
      autoAlpha: 0,
      y: 56,
      scale: 0.96,
      filter: "blur(8px)",
    }, {
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
        trigger: slider,
        start: "top 58%",
        once: true,
      },
      onComplete: () => {
        gsap.set(cards, {
          clearProps: "transform,filter,opacity,visibility",
        });
      },
    });
  });
};
