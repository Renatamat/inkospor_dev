import { getBootstrap } from "./bootstrap";

const DESKTOP_BREAKPOINT = "(min-width: 992px)";
const EAN_FILTER_KEYS = ["ean13", "ean"];
const EAN_FILTER_GROUP_KEY = "inkospornova-ean13";

type JQueryInstance = {
  data: (key: string, value?: unknown) => unknown;
  on: (events: string, handler: (...args: unknown[]) => void) => void;
  hasClass?: (className: string) => boolean;
};

type JQueryLike = {
  (selector: Element | Window | Document | string): JQueryInstance;
  fn?: {
    data?: (key?: string | Record<string, unknown>, value?: unknown) => unknown;
  };
};

const moveFiltersContent = (
  contentEl: HTMLElement,
  targetEl: HTMLElement
): void => {
  if (contentEl.parentElement === targetEl) {
    return;
  }

  targetEl.appendChild(contentEl);
};

const hideOffcanvas = (offcanvasEl: HTMLElement): void => {
  const { Offcanvas } = getBootstrap() as {
    Offcanvas?: {
      getInstance?: (el: Element) => { hide: () => void } | null;
      getOrCreateInstance?: (el: Element) => { hide: () => void };
    };
  };

  if (!Offcanvas) {
    return;
  }

  const instance =
    Offcanvas.getInstance?.(offcanvasEl) ??
    Offcanvas.getOrCreateInstance?.(offcanvasEl);

  instance?.hide();
};

const purgeStaleWcpfNotes = (): void => {
  const win = window as typeof window & {
    jQuery?: JQueryLike;
  };

  if (typeof win.jQuery !== "function") {
    return;
  }

  document.querySelectorAll<HTMLElement>(".c-wcpf-note-item").forEach((noteEl) => {
    const entry = win.jQuery?.(noteEl).data("wcpf-note-entry");

    if (!entry || typeof entry !== "object" || !("filterComponent" in entry)) {
      win.jQuery?.(noteEl).data("wcpf-note-entry", {
        filterComponent: {
          entity: {
            entityId: "__inkospornova_missing_wcpf_note__",
          },
        },
      });
    }
  });
};

const getUrl = (): URL | null => {
  try {
    return new URL(window.location.href);
  } catch {
    return null;
  }
};

const getActiveEanFilter = (): string => {
  const url = getUrl();

  if (!url) {
    return "";
  }

  for (const key of EAN_FILTER_KEYS) {
    const value = url.searchParams.get(key)?.trim();

    if (value) {
      return value;
    }
  }

  return "";
};

const getProductFilterId = (): string => {
  const notes = document.querySelector<HTMLElement>(".wcpf-filter-notes");
  const notesClass = Array.from(notes?.classList ?? []).find((className) =>
    className.startsWith("wcpf-filter-notes-")
  );

  if (notesClass) {
    return notesClass.replace("wcpf-filter-notes-", "");
  }

  const container = document.querySelector<HTMLElement>(
    "[class*='wcpf-products-container-']"
  );
  const containerClass = Array.from(container?.classList ?? []).find((className) =>
    className.startsWith("wcpf-products-container-")
  );

  return containerClass?.replace("wcpf-products-container-", "") || "56";
};

const removeEanFromCurrentUrl = (): string | null => {
  const url = getUrl();

  if (!url) {
    return null;
  }

  EAN_FILTER_KEYS.forEach((key) => url.searchParams.delete(key));
  url.searchParams.delete("paged");
  url.searchParams.delete("product-page");

  return url.toString();
};

const hasNonEanFilterNotes = (): boolean =>
  Array.from(document.querySelectorAll<HTMLElement>(".c-wcpf-note-item")).some(
    (noteEl) => noteEl.dataset.eanFilterNote !== "true"
  );

const getOrCreateFilterNotes = (): HTMLElement | null => {
  let notes = document.querySelector<HTMLElement>(".wcpf-filter-notes");

  if (notes) {
    return notes;
  }

  const listing = document.querySelector<HTMLElement>(".c-product-section");

  if (!listing?.parentElement) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className =
    "c-product-listing__wcpf-note d-flex flex-column gap-16 mb-24";
  wrapper.dataset.eanFilterNotesWrapper = "true";
  wrapper.innerHTML = `
    <div class="d-flex flex-wrap gap-8">
      <div class="wcpf-filter-notes d-flex gap-8 w-100 align-items-start justify-content-between no-wrap wcpf-filter-notes-${getProductFilterId()}">
        <div class="wcpf-note-list d-flex flex-wrap r-gap-8"></div>
      </div>
    </div>
  `;

  listing.parentElement.insertBefore(wrapper, listing);
  notes = wrapper.querySelector<HTMLElement>(".wcpf-filter-notes");

  return notes;
};

const removeEmptyEanNotesWrapper = (): void => {
  const wrapper = document.querySelector<HTMLElement>(
    "[data-ean-filter-notes-wrapper='true']"
  );

  if (
    wrapper &&
    !wrapper.querySelector(".c-wcpf-note-item") &&
    !wrapper.querySelector(".js-wcpf-clear-all")
  ) {
    wrapper.remove();
  }
};

const ensureEanClearAllButton = (notes: HTMLElement): void => {
  if (notes.querySelector(".js-wcpf-clear-all")) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "c-btn c-btn-s c-btn-text chip-s js-wcpf-clear-all";
  button.innerHTML = `
    <span class="c-product-left-side__clear fw-bold text-nowrap">Wyczyść filtry</span>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.792 1.417v1h4.125v-1H5.792Zm5.625 1V1.292c0-.365-.145-.714-.403-.972A1.375 1.375 0 0 0 10.042-.083H5.667c-.365 0-.714.145-.972.403a1.375 1.375 0 0 0-.403.972v1.125H.667a.75.75 0 0 0 0 1.5h.887l1.061 10.084c.052.491.284.946.651 1.277.367.331.844.514 1.338.514h6.5c.494 0 .971-.183 1.338-.514.367-.331.599-.786.651-1.277l1.062-10.084h.887a.75.75 0 0 0 0-1.5h-3.625Zm-.75 1.5H3.063l1.044 9.927c.013.123.071.237.163.319.092.083.211.129.335.129h6.499a.5.5 0 0 0 .497-.448l1.045-9.927h-1.979Z" fill="#030507"/>
    </svg>
  `;

  notes.appendChild(button);
};

const renderEanFilterNote = (): void => {
  const activeEan = getActiveEanFilter();
  const existingGroup = document.querySelector<HTMLElement>(
    `[data-group-key="${EAN_FILTER_GROUP_KEY}"]`
  );

  if (!activeEan) {
    existingGroup?.remove();
    removeEmptyEanNotesWrapper();
    return;
  }

  const notes = getOrCreateFilterNotes();
  const notesList = notes?.querySelector<HTMLElement>(".wcpf-note-list");

  if (!notes || !notesList) {
    return;
  }

  let group = existingGroup;

  if (!group) {
    group = document.createElement("div");
    group.className =
      "wcpf-note-list-group d-flex align-items-start mr-8";
    group.dataset.groupKey = EAN_FILTER_GROUP_KEY;
    group.innerHTML = `
      <span class="chip chip-s chip-s-name fw-bolder A">PRODUKT (EAN13)</span>
      <div class="wcpf-note-list-items d-flex flex-wrap gap-8"></div>
    `;
    notesList.appendChild(group);
  }

  const items = group.querySelector<HTMLElement>(".wcpf-note-list-items");

  if (!items) {
    return;
  }

  items.innerHTML = `
    <div class="c-wcpf-note-item chip chip-s --active js-ean13-filter-note" data-ean-filter-note="true">
      <span>${activeEan}</span>
      <svg class="js-remove-filter js-ean13-filter-remove" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.137 2.136a.75.75 0 0 1 1.06 0L8 6.94l4.803-4.803a.75.75 0 1 1 1.061 1.061L9.061 8l4.803 4.803a.75.75 0 0 1-1.061 1.061L8 9.061l-4.803 4.803a.75.75 0 0 1-1.06-1.061L6.938 8 2.137 3.197a.75.75 0 0 1 0-1.061Z" fill="black"/>
      </svg>
    </div>
  `;

  ensureEanClearAllButton(notes);
};

const syncEanHiddenInputs = (): void => {
  const activeEan = getActiveEanFilter();

  document.querySelectorAll<HTMLFormElement>("form.woocommerce-ordering").forEach(
    (form) => {
      let input = form.querySelector<HTMLInputElement>('input[name="ean13"]');

      if (!activeEan) {
        input?.remove();
        return;
      }

      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = "ean13";
        form.appendChild(input);
      }

      input.value = activeEan;
    }
  );
};

const navigateWithoutEanFilter = (): void => {
  const cleanUrl = removeEanFromCurrentUrl();

  if (!cleanUrl) {
    return;
  }

  window.location.assign(cleanUrl);
};

const initEanFilterIntegration = (): void => {
  if (document.body.dataset.eanFilterIntegrationInitialized === "true") {
    renderEanFilterNote();
    syncEanHiddenInputs();
    return;
  }

  document.body.dataset.eanFilterIntegrationInitialized = "true";

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".js-ean13-filter-note, .js-ean13-filter-remove")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateWithoutEanFilter();
        return;
      }

      if (target.closest(".js-wcpf-clear-all") && getActiveEanFilter()) {
        const cleanUrl = removeEanFromCurrentUrl();

        if (!cleanUrl) {
          return;
        }

        if (!hasNonEanFilterNotes()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(cleanUrl);
          return;
        }

        window.history.replaceState({}, document.title, cleanUrl);
      }
    },
    true
  );

  const win = window as typeof window & {
    jQuery?: JQueryLike;
  };

  if (typeof win.jQuery === "function") {
    win.jQuery(window).on(
      "wcpf_before_ajax_filtering wcpf_update_products wcpf_after_ajax_filtering",
      () => {
        renderEanFilterNote();
        syncEanHiddenInputs();
      }
    );
  }

  renderEanFilterNote();
  syncEanHiddenInputs();
};

const getCleanArchiveTitle = (heading: HTMLElement): string => {
  const storedTitle = heading.dataset.archiveTitle?.trim();

  if (storedTitle) {
    return storedTitle;
  }

  const clone = heading.cloneNode(true) as HTMLElement;
  clone.querySelector(".c-product-listing-header__count")?.remove();

  return clone.textContent?.trim().replace(/\s+/g, " ") ?? "";
};

const getArchiveCountText = (): string => {
  const technicalCount = document
    .querySelector<HTMLElement>(
      ".woocommerce-products-header__title .c-product-listing-header__count"
    )
    ?.textContent?.trim();

  if (technicalCount) {
    return technicalCount;
  }

  return `(${document.querySelectorAll(".c-product-card").length})`;
};

const getArchiveTitleText = (): string => {
  const sources = [
    document.querySelector<HTMLElement>(".c-product-listing-header")?.dataset
      .archiveTitle,
    document.querySelector<HTMLElement>(".c-product-listing-header__heading")
      ?.dataset.archiveTitle,
    document.querySelector<HTMLElement>(".woocommerce-products-header__title")
      ?.dataset.archiveTitle,
  ];

  for (const source of sources) {
    const title = source?.trim();

    if (title) {
      return title;
    }
  }

  const technicalTitle = document
    .querySelector<HTMLElement>(".woocommerce-products-header__title")
    ?.textContent?.trim()
    .replace(/\([^)]*\)\s*$/, "")
    .replace(/\s+/g, " ");

  if (technicalTitle) {
    return technicalTitle;
  }

  return document.title.split(" - ")[0]?.trim() ?? "";
};

const ensureArchiveHeading = (): HTMLElement | null => {
  const header = document.querySelector<HTMLElement>(".c-product-listing-header");

  if (!header) {
    return null;
  }

  let titleWrap = header.querySelector<HTMLElement>(
    ".c-product-listing-header__title"
  );
  const sort = header.querySelector<HTMLElement>(".c-product-listing-header__sort");

  if (!titleWrap) {
    titleWrap = document.createElement("div");
    titleWrap.className = "c-product-listing-header__title";

    if (sort) {
      header.insertBefore(titleWrap, sort);
    } else {
      header.prepend(titleWrap);
    }
  }

  let heading = titleWrap.querySelector<HTMLElement>(
    ".c-product-listing-header__heading"
  );

  if (!heading) {
    heading = document.createElement("h1");
    heading.className =
      "p-l fw-bold m-0 c-product-listing-header__heading p-brand";
    titleWrap.appendChild(heading);
  }

  const title = getArchiveTitleText();

  if (title) {
    header.dataset.archiveTitle = title;
    heading.dataset.archiveTitle = title;
  }

  return heading;
};

const stabilizeArchiveHeading = (): void => {
  const ensuredHeading = ensureArchiveHeading();
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(".c-product-listing-header__heading")
  );

  if (ensuredHeading && !headings.includes(ensuredHeading)) {
    headings.push(ensuredHeading);
  }

  headings.forEach((heading) => {
    const title = getCleanArchiveTitle(heading);

    if (!title) {
      return;
    }

    const currentCount = heading
      .querySelector<HTMLElement>(".c-product-listing-header__count")
      ?.textContent?.trim();
    const count = getArchiveCountText() || currentCount || "(0)";

    heading.dataset.archiveTitle = title;
    heading.textContent = `${title} `;

    const countEl = document.createElement("span");
    countEl.className = "c-product-listing-header__count fw-normal";
    countEl.textContent = count;

    heading.appendChild(countEl);
  });
};

const initWcpfNotesDataGuard = (): void => {
  const win = window as typeof window & {
    jQuery?: JQueryLike;
  };

  if (
    typeof win.jQuery !== "function" ||
    !win.jQuery.fn?.data ||
    document.body.dataset.wcpfNotesDataGuardInitialized === "true"
  ) {
    return;
  }

  document.body.dataset.wcpfNotesDataGuardInitialized = "true";

  const originalData = win.jQuery.fn.data;

  win.jQuery.fn.data = function patchedData(
    this: { hasClass?: (className: string) => boolean },
    key?: string | Record<string, unknown>,
    value?: unknown
  ) {
    const result = originalData.apply(
      this,
      Array.from(arguments) as [string | Record<string, unknown> | undefined, unknown?]
    );

    if (
      key === "wcpf-note-entry" &&
      value === undefined &&
      (!result || typeof result !== "object" || !("filterComponent" in result)) &&
      typeof this.hasClass === "function" &&
      this.hasClass("c-wcpf-note-item")
    ) {
      return {
        filterComponent: {
          entity: {
            entityId: "__inkospornova_missing_wcpf_note__",
          },
        },
      };
    }

    return result;
  };
};

const initWcpfNotesGuard = (): void => {
  if (document.body.dataset.wcpfNotesGuardInitialized === "true") {
    return;
  }

  initWcpfNotesDataGuard();
  document.body.dataset.wcpfNotesGuardInitialized = "true";

  const purgeBeforeWcpfInteraction = (event: Event): void => {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest(".wcpf-filter, .wcpf-filter-notes, .wcpf-item, .wcpf-input")
    ) {
      purgeStaleWcpfNotes();
    }
  };

  ["pointerdown", "mousedown", "click", "change"].forEach((eventName) => {
    document.addEventListener(eventName, purgeBeforeWcpfInteraction, true);
  });

  const win = window as typeof window & {
    jQuery?: JQueryLike;
  };

  if (typeof win.jQuery === "function") {
    win.jQuery(window).on(
      "wcpf_before_ajax_filtering wcpf_update_products wcpf_after_ajax_filtering",
      () => {
        purgeStaleWcpfNotes();
        window.requestAnimationFrame(stabilizeArchiveHeading);
      }
    );
  }
};

export const initArchiveFilters = (): void => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const desktopSlot = document.querySelector<HTMLElement>(
    ".js-product-filters-desktop-slot"
  );
  const mobileSlot = document.querySelector<HTMLElement>(
    ".js-product-filters-offcanvas-slot"
  );
  const contentEl = document.querySelector<HTMLElement>(
    ".js-product-filters-content"
  );
  const offcanvasEl = document.getElementById("filtersOffcanvas");

  if (!desktopSlot || !mobileSlot || !contentEl || !offcanvasEl) {
    initWcpfNotesGuard();
    initEanFilterIntegration();
    stabilizeArchiveHeading();
    return;
  }

  const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT);

  const syncFiltersLayout = (): void => {
    if (mediaQuery.matches) {
      hideOffcanvas(offcanvasEl);
      moveFiltersContent(contentEl, desktopSlot);
      return;
    }

    moveFiltersContent(contentEl, mobileSlot);
  };

  syncFiltersLayout();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncFiltersLayout);
  } else {
    mediaQuery.addListener(syncFiltersLayout);
  }

  offcanvasEl.addEventListener("hidden.bs.offcanvas", syncFiltersLayout);

  initWcpfNotesGuard();
  initEanFilterIntegration();
  stabilizeArchiveHeading();
};
