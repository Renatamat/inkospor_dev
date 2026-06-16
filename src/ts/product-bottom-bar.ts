export const initProductBottomBar = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  let ticking = false;
  let archiveModeInitialized = false;

  const getBar = (): HTMLElement | null =>
    document.querySelector<HTMLElement>("[data-product-bottom-bar]");

  const setVisible = (isVisible: boolean): void => {
    const bar = getBar();
    if (!bar) return;

    bar.classList.toggle("--visible", isVisible);
    bar.setAttribute("aria-hidden", String(!isVisible));
  };

  const getArchiveQuantityInputs = (): HTMLInputElement[] =>
    Array.from(document.querySelectorAll<HTMLInputElement>("[data-archive-group-quantity]"));

  const getQuantityValue = (input: HTMLInputElement): number => {
    const value = Number.parseInt(input.value.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const formatPrice = (value: number, currency: string): string =>
    new Intl.NumberFormat(document.documentElement.lang || "pl-PL", {
      style: "currency",
      currency,
    }).format(value);

  const setButtonDisabled = (button: HTMLButtonElement, isDisabled: boolean): void => {
    button.disabled = isDisabled;
    button.setAttribute("aria-disabled", String(isDisabled));
    button.classList.toggle("disabled", isDisabled);
  };

  const updateArchiveGroupButtons = (): void => {
    document.querySelectorAll<HTMLFormElement>("[data-archive-precart-form]").forEach((form) => {
      const totalQuantity = Array.from(
        form.querySelectorAll<HTMLInputElement>("[data-archive-group-quantity]")
      ).reduce((sum, input) => sum + getQuantityValue(input), 0);
      const button = form.querySelector<HTMLButtonElement>("[data-archive-group-submit]");

      if (button) setButtonDisabled(button, totalQuantity <= 0);
    });
  };

  const updateArchivePreCart = (): void => {
    const inputs = getArchiveQuantityInputs();
    const bar = getBar();

    if (!bar || inputs.length === 0) return;

    const currency = bar.dataset.currencyCode || "PLN";
    const totals = inputs.reduce(
      (result, input) => {
        const quantity = getQuantityValue(input);
        const price = Number.parseFloat(input.dataset.productPrice || "0");

        result.quantity += quantity;
        result.total += quantity * (Number.isFinite(price) ? price : 0);

        return result;
      },
      { quantity: 0, total: 0 }
    );

    const countEl = bar.querySelector<HTMLElement>(".js-product-bottom-bar-count");
    const totalEl = bar.querySelector<HTMLElement>(".js-product-bottom-bar-total");
    const submitEl = bar.querySelector<HTMLElement>("[data-product-bottom-bar-submit]");
    const labelEl = submitEl?.querySelector<HTMLElement>("span");

    bar.dataset.itemsCount = String(totals.quantity);
    if (countEl) countEl.textContent = String(totals.quantity);
    if (totalEl) totalEl.textContent = formatPrice(totals.total, currency);
    if (labelEl) labelEl.textContent = "Dodaj wszystko do koszyka";
    submitEl?.classList.toggle("disabled", totals.quantity <= 0);
    submitEl?.setAttribute("aria-disabled", String(totals.quantity <= 0));

    updateArchiveGroupButtons();
  };

  const submitArchivePreCart = (): void => {
    const selectedInputs = getArchiveQuantityInputs().filter((input) => getQuantityValue(input) > 0);
    const sourceForm = selectedInputs[0]?.closest<HTMLFormElement>("form");

    if (!sourceForm) return;

    const form = document.createElement("form");
    form.method = "post";
    form.action = sourceForm.action || window.location.href;
    form.style.display = "none";

    const appendHidden = (name: string, value: string): void => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const nonce = sourceForm.querySelector<HTMLInputElement>(
      'input[name="healion_archive_group_add_to_cart_nonce"]'
    )?.value;

    appendHidden("healion_archive_group_add_to_cart", "1");
    if (nonce) appendHidden("healion_archive_group_add_to_cart_nonce", nonce);

    selectedInputs.forEach((input) => {
      const productId = input.dataset.productId;
      if (!productId) return;

      appendHidden(`healion_archive_group_quantities[${productId}]`, String(getQuantityValue(input)));
    });

    document.body.appendChild(form);
    form.submit();
  };

  const update = (): void => {
    const bar = getBar();

    if (!bar) {
      ticking = false;
      return;
    }

    updateArchivePreCart();

    const itemsCount = Number(bar.dataset.itemsCount ?? "0");

    if (itemsCount <= 0) {
      bar.classList.add("d-none");
      bar.classList.remove("--visible", "--stopped");
      bar.style.removeProperty("--product-bottom-bar-top");
      bar.setAttribute("aria-hidden", "true");
      ticking = false;
      return;
    }

    if (getArchiveQuantityInputs().length > 0) {
      bar.classList.remove("d-none", "--stopped");
      bar.style.removeProperty("--product-bottom-bar-top");
      setVisible(true);
      ticking = false;
      return;
    }

    bar.classList.remove("d-none");

    const header = document.querySelector<HTMLElement>(".headerWrapper");
    const footer = document.querySelector<HTMLElement>(".c-footer");
    const isHeaderGone = header
      ? header.getBoundingClientRect().bottom <= 0
      : window.scrollY > 160;

    const shouldStopAtFooter = footer
      ? footer.getBoundingClientRect().top <= window.innerHeight
      : false;

    if (footer && shouldStopAtFooter) {
      const footerTop = footer.getBoundingClientRect().top + window.scrollY;
      const barTop = Math.max(0, footerTop - bar.offsetHeight);

      bar.style.setProperty("--product-bottom-bar-top", `${barTop}px`);
      bar.classList.add("--stopped");
    } else {
      bar.classList.remove("--stopped");
      bar.style.removeProperty("--product-bottom-bar-top");
    }

    setVisible(isHeaderGone);
    ticking = false;
  };

  const requestUpdate = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();

  if (document.body.dataset.productBottomBarBound === "true") {
    requestUpdate();
    return;
  }

  document.body.dataset.productBottomBarBound = "true";
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  document.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches("[data-archive-group-quantity]")) return;

    requestUpdate();
  });
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;
    if (!target.closest("[data-product-bottom-bar-submit]")) return;
    if (getArchiveQuantityInputs().length === 0) return;

    event.preventDefault();
    if (Number(getBar()?.dataset.itemsCount ?? "0") <= 0) return;

    submitArchivePreCart();
  });
  document.addEventListener("submit", (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches("[data-archive-precart-form]")) return;

    const totalQuantity = Array.from(
      form.querySelectorAll<HTMLInputElement>("[data-archive-group-quantity]")
    ).reduce((sum, input) => sum + getQuantityValue(input), 0);

    if (totalQuantity <= 0) event.preventDefault();
  });

  if (!archiveModeInitialized && getArchiveQuantityInputs().length > 0) {
    archiveModeInitialized = true;
    requestUpdate();
  }

  const win = window as typeof window & {
    jQuery?: (selector: HTMLElement | Document | Window | string) => {
      on: (events: string, handler: () => void) => void;
    };
  };

  if (typeof win.jQuery === "function") {
    win.jQuery(document.body).on(
      "added_to_cart removed_from_cart updated_wc_div wc_fragments_loaded wc_fragments_refreshed",
      () => {
        window.setTimeout(requestUpdate, 50);
      }
    );
    win.jQuery(window).on(
      "wcpf_before_ajax_filtering wcpf_update_products wcpf_after_ajax_filtering",
      () => {
        window.setTimeout(requestUpdate, 50);
      }
    );
  }
};
