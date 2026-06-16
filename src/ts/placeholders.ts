export const initBootstrapPlaceholders = (root: ParentNode = document): void => {
  const wrappers = root.querySelectorAll<HTMLElement>("[data-placeholder-target]");

  wrappers.forEach((wrapper) => {
    const isLoaded = wrapper.dataset.loaded === "true";

    const placeholders = wrapper.querySelectorAll<HTMLElement>("[data-placeholder]");
    const content = wrapper.querySelectorAll<HTMLElement>("[data-content]");

    placeholders.forEach((el) => {
      el.classList.toggle("d-none", isLoaded);
      el.setAttribute("aria-hidden", isLoaded ? "true" : "false");
    });

    content.forEach((el) => {
      el.classList.toggle("d-none", !isLoaded);
    });
  });
};

export const setPlaceholderLoaded = (
  target: HTMLElement,
  loaded: boolean
): void => {
  target.dataset.loaded = loaded ? "true" : "false";
  initBootstrapPlaceholders(target);
};