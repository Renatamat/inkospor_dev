const initializedSelectors = new WeakSet<HTMLElement>();

const getTarget = (item: HTMLElement): string =>
  item.dataset.goalTarget || "";

export const initHomepageGoals = (root: ParentNode = document): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<HTMLElement>("[data-goal-selector]").forEach((section) => {
    if (initializedSelectors.has(section)) return;

    const visuals = Array.from(
      section.querySelectorAll<HTMLImageElement>("[data-goal-visual]"),
    );
    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-goal-item]"),
    );
    if (!visuals.length || !items.length) return;

    initializedSelectors.add(section);

    let activeItem = items.find((item) => item.classList.contains("--active")) || items[0];

    const showItemVisual = (item: HTMLElement): void => {
      const target = getTarget(item);
      if (!target) return;

      section.dispatchEvent(
        new CustomEvent("homepage-goals:visual-change", {
          detail: { target },
        }),
      );
    };

    const activateItem = (item: HTMLElement): void => {
      activeItem = item;
      items.forEach((candidate) => {
        const isActive = candidate === item;
        candidate.classList.toggle("--active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      showItemVisual(item);
    };

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => showItemVisual(item));
      item.addEventListener("mouseleave", () => showItemVisual(activeItem));
      item.addEventListener("focus", () => showItemVisual(item));
      item.addEventListener("blur", () => showItemVisual(activeItem));
      item.addEventListener("click", (event) => {
        event.preventDefault();
        activateItem(item);
      });
      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateItem(item);
      });
    });

    section.addEventListener("homepage-goals:activate", ((event: Event) => {
      const { index } = (event as CustomEvent<{ index?: number }>).detail || {};
      if (typeof index !== "number" || !items[index]) return;
      activateItem(items[index]);
    }) as EventListener);

    activateItem(activeItem);
  });
};
