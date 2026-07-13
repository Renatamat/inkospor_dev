import gsap from "gsap";

const initializedHeaders = new WeakSet<HTMLElement>();

export const initBlogHeaderAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".bl-header").forEach((section) => {
    if (initializedHeaders.has(section)) return;

    const content = section.querySelector<HTMLElement>(".container.position-relative");
    const title = content?.querySelector<HTMLElement>("h1");
    const lead = content?.querySelector<HTMLElement>("span");
    const description = content?.querySelector<HTMLElement>("p");
    const items = [title, lead, description].filter(Boolean) as HTMLElement[];

    if (!items.length) return;

    initializedHeaders.add(section);
    gsap.killTweensOf(items);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { clearProps: "transform,opacity,visibility" });
      return;
    }

    gsap.set(items, {
      opacity: 0,
      x: -60,
    });

    requestAnimationFrame(() => {
      gsap.to(items, {
        opacity: 1,
        x: 0,
        duration: 0.62,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.24,
      });
    });
  });
};
