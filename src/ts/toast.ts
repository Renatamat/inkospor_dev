import Toast from "bootstrap/js/dist/toast";

type ToastVariant = "success" | "error" | "info" | "warning";

type AddedToCartButtonLike =
  | HTMLElement
  | { get: (index: number) => HTMLElement | undefined }
  | unknown;

type JQueryLike = {
  on: (
    eventNames: string,
    handler: (
      event: Event,
      fragments?: Record<string, string>,
      cartHash?: string,
      button?: AddedToCartButtonLike
    ) => void
  ) => void;
};

type WooCheckoutErrorResponse = {
  messages?: string;
};

type WindowWithToastHelpers = typeof window & {
  jQuery?: (selector: HTMLElement | Document | string) => JQueryLike;
  showToast?: (message: string, variant?: ToastVariant) => void;
  flushWooCommerceNoticeHtml?: (html: string) => void;
};

const TOAST_VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "toast--success",
  error: "toast--error",
  info: "toast--info",
  warning: "toast--warning",
};

const MAX_VISIBLE_TOASTS = 4;
const EARLY_DISMISS_DELAY_MS = 900;
const EARLY_DISMISS_STAGGER_MS = 120;

const pendingToasts: { message: string; variant: ToastVariant }[] = [];

const getButtonElement = (button?: AddedToCartButtonLike): HTMLElement | null => {
  if (!button) return null;

  if (button instanceof HTMLElement) {
    return button;
  }

  if (
    typeof button === "object" &&
    button !== null &&
    "get" in button &&
    typeof (button as { get: unknown }).get === "function"
  ) {
    return (button as { get: (index: number) => HTMLElement | undefined }).get(0) ?? null;
  }

  return null;
};

const cleanText = (value: string): string =>
  value.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

const cleanProductName = (value: string): string =>
  cleanText(value).replace(/^\s*(dodaj do koszyka|do koszyka)\s*:?\s*/i, "");

const getProductNameFromContext = (buttonEl: HTMLElement | null): string | null => {
  if (!buttonEl) return null;

  const productCardTitle = buttonEl
    .closest(".c-product-card")
    ?.querySelector<HTMLElement>(".c-product-card__title, h2, h3");

  if (productCardTitle?.textContent?.trim()) {
    return cleanProductName(productCardTitle.textContent);
  }

  if (buttonEl.matches(".single_add_to_cart_button")) {
    const singleProductTitle = document.querySelector<HTMLElement>(".product_title, .entry-title");

    if (singleProductTitle?.textContent?.trim()) {
      return cleanProductName(singleProductTitle.textContent);
    }
  }

  return null;
};

const getProductNameFromButton = (buttonEl: HTMLElement | null): string => {
  const contextualName = getProductNameFromContext(buttonEl);

  if (contextualName) {
    return contextualName;
  }

  const rawName =
    buttonEl?.getAttribute("data-product_name") ||
    buttonEl?.getAttribute("aria-label") ||
    buttonEl?.textContent?.trim() ||
    "Produkt";

  return cleanProductName(rawName) || "Produkt";
};

const getPolishQuantityLabel = (quantity: number): string => {
  if (quantity === 1) return "1 sztuka";

  const mod10 = quantity % 10;
  const mod100 = quantity % 100;

  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${quantity} sztuki`;
  }

  return `${quantity} sztuk`;
};

const mapNoticeTypeToToastVariant = (type?: string): ToastVariant => {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "notice":
    case "info":
    default:
      return "info";
  }
};

const getToastContainer = (): HTMLElement | null =>
  document.getElementById("cartToastContainer");

const getToastTemplate = (): HTMLTemplateElement | null => {
  const template = document.getElementById("cartToastTemplate");
  return template instanceof HTMLTemplateElement ? template : null;
};

const normalizeToastMessage = (message: string): string => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = message;

  wrapper
    .querySelectorAll(".restore-item, a[href*='undo_item'], a[href*='undo']")
    .forEach((restoreLink) => restoreLink.remove());

  return cleanText(wrapper.textContent || wrapper.innerText || message);
};

const getToastDelay = (message: string, variant: ToastVariant): number => {
  const words = normalizeToastMessage(message).split(/\s+/).filter(Boolean).length;
  const readingTimeMs = Math.ceil((words / 3) * 1000);
  const minDelayMs = variant === "error" || variant === "warning" ? 5500 : 4000;
  const extraBufferMs = variant === "error" || variant === "warning" ? 3500 : 2500;

  return Math.min(8000, Math.max(minDelayMs, readingTimeMs + extraBufferMs));
};

const getActiveToastElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(".toast"));

const syncToastBackgroundState = (): void => {
  const container = getToastContainer();
  const background = document.querySelector<HTMLElement>(".js-toast-bg");

  if (!container || !background) return;

  background.classList.toggle("--active", getActiveToastElements(container).length > 0);
};

const setToastA11yAttributes = (toastEl: HTMLElement, variant: ToastVariant): void => {
  toastEl.setAttribute("role", variant === "error" ? "alert" : "status");
  toastEl.setAttribute("aria-live", variant === "error" ? "assertive" : "polite");
  toastEl.setAttribute("aria-atomic", "true");
};

const scheduleToastHideSoon = (toastEl: HTMLElement, index: number): void => {
  if (toastEl.dataset.toastClosingSoon === "true") return;

  toastEl.dataset.toastClosingSoon = "true";

  window.setTimeout(() => {
    Toast.getOrCreateInstance(toastEl).hide();
  }, EARLY_DISMISS_DELAY_MS + index * EARLY_DISMISS_STAGGER_MS);
};

const requestToastSlots = (): void => {
  const container = getToastContainer();
  if (!container) return;

  const activeToasts = getActiveToastElements(container);
  const overflow = activeToasts.length + pendingToasts.length - MAX_VISIBLE_TOASTS;

  if (overflow <= 0) return;

  let scheduled = 0;

  for (const toastEl of activeToasts) {
    if (scheduled >= overflow) break;
    if (toastEl.dataset.toastClosingSoon === "true") continue;

    scheduleToastHideSoon(toastEl, scheduled);
    scheduled += 1;
  }
};

const drainPendingToasts = (): void => {
  const container = getToastContainer();
  const template = getToastTemplate();

  if (!container || !template) return;

  while (pendingToasts.length > 0 && getActiveToastElements(container).length < MAX_VISIBLE_TOASTS) {
    const nextToast = pendingToasts.shift();
    if (!nextToast) break;

    renderToast(nextToast.message, nextToast.variant, container, template);
  }

  syncToastBackgroundState();
};

const renderToast = (
  message: string,
  variant: ToastVariant,
  container: HTMLElement,
  template: HTMLTemplateElement
): void => {
  const normalizedMessage = normalizeToastMessage(message);

  if (!normalizedMessage) return;

  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const toastEl = fragment.querySelector<HTMLElement>(".toast");
  const textEl = fragment.querySelector<HTMLElement>(".js-cart-toast-text");

  if (!toastEl || !textEl) return;

  textEl.textContent = normalizedMessage;
  toastEl.classList.remove(...Object.values(TOAST_VARIANT_CLASSES));
  toastEl.classList.add(TOAST_VARIANT_CLASSES[variant]);
  setToastA11yAttributes(toastEl, variant);

  const delay = getToastDelay(normalizedMessage, variant);
  toastEl.setAttribute("data-bs-delay", String(delay));

  container.appendChild(toastEl);
  syncToastBackgroundState();

  const toast = Toast.getOrCreateInstance(toastEl, {
    animation: true,
    autohide: true,
    delay,
  });

  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
    syncToastBackgroundState();
    drainPendingToasts();
    requestToastSlots();
  });

  toast.show();
};

const showToast = (message: string, variant: ToastVariant = "success"): void => {
  const container = getToastContainer();
  const template = getToastTemplate();

  if (!container || !template) return;

  if (getActiveToastElements(container).length >= MAX_VISIBLE_TOASTS) {
    pendingToasts.push({ message, variant });
    requestToastSlots();
    return;
  }

  renderToast(message, variant, container, template);
  requestToastSlots();
};

const flushWooCommerceNotices = (scope: ParentNode = document): void => {
  const notices = scope.querySelectorAll<HTMLElement>(".js-wc-toast-notice");

  notices.forEach((noticeEl) => {
    if (noticeEl.dataset.toastRendered === "true") return;

    showToast(noticeEl.innerHTML, mapNoticeTypeToToastVariant(noticeEl.dataset.toastType));
    noticeEl.dataset.toastRendered = "true";
    noticeEl.remove();
  });
};

const flushWooCommerceNoticeHtml = (html: string): void => {
  if (!html) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  flushWooCommerceNotices(wrapper);
};

const bindWooCommerceJQueryEvents = (): void => {
  const win = window as WindowWithToastHelpers;

  if (typeof win.jQuery !== "function") return;

  win.jQuery(document.body).on(
    "added_to_cart",
    (
      _event: Event,
      _fragments?: Record<string, string>,
      _cartHash?: string,
      button?: AddedToCartButtonLike
    ): void => {
      const productName = getProductNameFromButton(getButtonElement(button));

      window.setTimeout(() => {
        showToast(`Dodano do koszyka: ${productName}`, "success");
      }, 50);
    }
  );

  win.jQuery(document.body).on(
    "updated_wc_div updated_cart_totals updated_checkout applied_coupon removed_coupon wc_fragments_loaded cart_page_refreshed cart_totals_refreshed",
    (): void => {
      window.setTimeout(() => flushWooCommerceNotices(), 50);
    }
  );

  win.jQuery(document.body).on(
    "checkout_error",
    (_event: Event, response?: WooCheckoutErrorResponse): void => {
      window.setTimeout(() => {
        if (response?.messages) {
          flushWooCommerceNoticeHtml(response.messages);
          return;
        }

        flushWooCommerceNotices();
      }, 50);
    }
  );
};

const bindCustomWindowEvents = (): void => {
  window.addEventListener(
    "cart_item_added",
    ((event: Event) => {
      const custom = event as CustomEvent<{ button?: AddedToCartButtonLike }>;
      const productName = getProductNameFromButton(getButtonElement(custom.detail?.button));
      showToast(`Dodano do koszyka: ${productName}`, "success");
    }) as EventListener
  );

  window.addEventListener(
    "cart_item_removed",
    ((event: Event) => {
      const custom = event as CustomEvent<{ productName: string; quantity: number }>;
      const { productName, quantity } = custom.detail;
      showToast(`Usunięto z koszyka: ${productName} (${getPolishQuantityLabel(quantity)})`, "info");
    }) as EventListener
  );

  window.addEventListener(
    "cart_item_updated",
    ((event: Event) => {
      const custom = event as CustomEvent<{ productName: string; quantity: number }>;
      const { productName, quantity } = custom.detail;
      showToast(
        `Zaktualizowano koszyk: ${productName} (${getPolishQuantityLabel(quantity)})`,
        "info"
      );
    }) as EventListener
  );

  window.addEventListener(
    "cart_coupon_applied",
    ((event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      showToast(custom.detail?.message || "Kod rabatowy został aktywowany.", "success");
    }) as EventListener
  );

  window.addEventListener(
    "cart_coupon_removed",
    ((event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      showToast(custom.detail?.message || "Kupon został usunięty.", "info");
    }) as EventListener
  );

  window.addEventListener(
    "cart_coupon_error",
    ((event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      showToast(custom.detail?.message || "Nie udało się wykonać operacji na kuponie.", "error");
    }) as EventListener
  );

  window.addEventListener(
    "cart_coupon_auto_removed",
    ((event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      showToast(
        custom.detail?.message ||
          "Jeden z kuponów punktowych został automatycznie usunięty po zmianie koszyka.",
        "warning"
      );
    }) as EventListener
  );

  window.addEventListener(
    "cart_notice",
    ((event: Event) => {
      const custom = event as CustomEvent<{ message?: string; type?: string }>;

      if (!custom.detail?.message) {
        return;
      }

      showToast(custom.detail.message, mapNoticeTypeToToastVariant(custom.detail.type));
    }) as EventListener
  );
};

export const initToast = (): void => {
  if (document.body.dataset.cartToastInitialized === "true") return;

  document.body.dataset.cartToastInitialized = "true";

  syncToastBackgroundState();
  flushWooCommerceNotices();
  bindWooCommerceJQueryEvents();
  bindCustomWindowEvents();

  const win = window as WindowWithToastHelpers;
  win.showToast = showToast;
  win.flushWooCommerceNoticeHtml = flushWooCommerceNoticeHtml;
};
