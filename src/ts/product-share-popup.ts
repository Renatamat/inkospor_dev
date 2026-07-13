const getShareUrl = (): string => window.location.href;

const getProductName = (trigger: HTMLElement): string => {
  const section = trigger.closest<HTMLElement>(".pr-header");
  const title = section?.querySelector<HTMLElement>("[data-product-header-copy] h1");

  return title?.textContent?.trim() || document.title;
};

const updateSocialLinks = (popup: HTMLElement, productName: string, shareUrl: string): void => {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(productName);

  popup.querySelectorAll<HTMLAnchorElement>("[data-product-share-social]").forEach((link) => {
    const type = link.dataset.productShareSocial;

    if (type === "facebook") {
      link.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    if (type === "x") {
      link.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    }

    if (type === "linkedin") {
      link.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }
  });
};

const openPopup = (popup: HTMLElement, trigger: HTMLElement): void => {
  const productName = getProductName(trigger);
  const shareUrl = getShareUrl();
  const title = popup.querySelector<HTMLElement>("[data-product-share-title]");
  const urlInput = popup.querySelector<HTMLInputElement>("[data-product-share-url]");

  if (title) title.textContent = productName;
  if (urlInput) urlInput.value = shareUrl;

  updateSocialLinks(popup, productName, shareUrl);

  popup.classList.add("--active");
  popup.setAttribute("aria-hidden", "false");
  document.body.classList.add("popup-share-open");
};

const closePopup = (popup: HTMLElement): void => {
  popup.classList.remove("--active");
  popup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("popup-share-open");
};

const showCopyTooltip = (button: HTMLElement): void => {
  let tooltip = button.querySelector<HTMLElement>(".share-copy-tooltip");

  if (!tooltip) {
    tooltip = document.createElement("span");
    tooltip.className = "share-copy-tooltip";
    tooltip.textContent = "Skopiowano link";
    button.appendChild(tooltip);
  }

  window.clearTimeout(Number(button.dataset.copyTooltipTimeout || 0));
  tooltip.classList.add("--show");

  const timeout = window.setTimeout(() => {
    tooltip?.classList.remove("--show");
  }, 1800);

  button.dataset.copyTooltipTimeout = String(timeout);
};

const copyShareUrl = async (popup: HTMLElement, button: HTMLElement): Promise<void> => {
  const input = popup.querySelector<HTMLInputElement>("[data-product-share-url]");
  if (!input) return;

  try {
    await navigator.clipboard.writeText(input.value);
  } catch {
    input.select();
    document.execCommand("copy");
    input.blur();
  }

  showCopyTooltip(button);
};

export const initProductSharePopup = (): void => {
  if (document.body.dataset.productShareInitialized === "true") return;

  document.body.dataset.productShareInitialized = "true";

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target;

    const trigger = target.closest<HTMLElement>("[data-product-share-trigger]");
    if (trigger) {
      const popup = document.querySelector<HTMLElement>("[data-product-share-popup]");
      if (!popup) return;

      event.preventDefault();
      openPopup(popup, trigger);

      return;
    }

    const closeButton = target.closest<HTMLElement>("[data-product-share-close]");
    if (closeButton) {
      const popup = closeButton.closest<HTMLElement>("[data-product-share-popup]");
      if (!popup) return;

      closePopup(popup);

      return;
    }

    const copyButton = target.closest<HTMLElement>("[data-product-share-copy]");
    if (copyButton) {
      const popup = copyButton.closest<HTMLElement>("[data-product-share-popup]");
      if (!popup) return;

      event.preventDefault();
      void copyShareUrl(popup, copyButton);

      return;
    }

    const popup = target.matches("[data-product-share-popup]")
      ? (target as HTMLElement)
      : null;

    if (popup) {
      closePopup(popup);
    }
  });

  document.addEventListener("keydown", (event) => {
    const popup = document.querySelector<HTMLElement>("[data-product-share-popup].--active");
    if (!popup) return;

    if (event.key === "Escape" && popup.classList.contains("--active")) {
      closePopup(popup);
    }
  });
};
