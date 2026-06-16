import "bootstrap/dist/js/bootstrap.bundle.min.js";

type BsCollapseCtor = new (
  el: Element,
  options?: { toggle?: boolean; parent?: Element | string | null }
) => {
  toggle: () => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
};

type BsModalCtor = new (
  el: Element,
  options?: { backdrop?: boolean | "static"; keyboard?: boolean; focus?: boolean }
) => {
  toggle: () => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
};

type BsTabCtor = new (
  el: Element
) => {
  show: () => void;
  dispose: () => void;
};

type BsTooltipCtor = new (
  el: Element,
  options?: BsTooltipOptions
) => {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  dispose: () => void;
  update: () => void;
};

type BsTooltipOptions = {
  animation?: boolean;
  container?: Element | string | false;
  customClass?: string;
  delay?: number | { show: number; hide: number };
  html?: boolean;
  offset?: [number, number] | string | ((...args: any[]) => any);
  placement?: string | ((...args: any[]) => any);
  title?: string | Element | ((...args: any[]) => any);
  trigger?: string;
};

type BsTooltipInstance = InstanceType<BsTooltipCtor>;

type BsToastCtor = new (
  el: Element,
  options?: { animation?: boolean; autohide?: boolean; delay?: number }
) => {
  show: () => void;
  hide: () => void;
  dispose: () => void;
};

type BootstrapInstanceHelpers<T> = T & {
  getInstance?: (el: Element) => any;
  getOrCreateInstance?: (el: Element, options?: any) => any;
};

export const getBootstrap = (): {
  Collapse?: BootstrapInstanceHelpers<BsCollapseCtor>;
  Modal?: BootstrapInstanceHelpers<BsModalCtor>;
  Tab?: BootstrapInstanceHelpers<BsTabCtor>;
  Tooltip?: BootstrapInstanceHelpers<BsTooltipCtor>;
  Toast?: BootstrapInstanceHelpers<BsToastCtor>;
} => {
  return (window as any).bootstrap ?? {};
};

export const initBootstrapCollapse = (): void => {
  if (typeof document === "undefined") return;

  const { Collapse } = getBootstrap();
  if (!Collapse) return;

  document.querySelectorAll<HTMLElement>(".collapse").forEach((el) => {
    if (Collapse.getOrCreateInstance) {
      Collapse.getOrCreateInstance(el, { toggle: false });
      return;
    }

    if (Collapse.getInstance?.(el)) return;
    new Collapse(el, { toggle: false });
  });
};

export const initBootstrapModal = (): void => {
  if (typeof document === "undefined") return;

  const { Modal } = getBootstrap();
  if (!Modal) return;

  document.querySelectorAll<HTMLElement>(".modal").forEach((el) => {
    if (Modal.getOrCreateInstance) {
      Modal.getOrCreateInstance(el, {
        backdrop: true,
        keyboard: true,
        focus: true,
      });
      return;
    }

    if (Modal.getInstance?.(el)) return;
    new Modal(el, {
      backdrop: true,
      keyboard: true,
      focus: true,
    });
  });
};

export const initBootstrapTabs = (): void => {
  if (typeof document === "undefined") return;

  const { Tab } = getBootstrap();
  if (!Tab) return;

  document.querySelectorAll<HTMLElement>('[data-bs-toggle="tab"]').forEach((el) => {
    if (Tab.getOrCreateInstance) {
      Tab.getOrCreateInstance(el);
      return;
    }

    if (Tab.getInstance?.(el)) return;
    new Tab(el);
  });
};


export const initBootstrapTooltips = (): void => {
  if (typeof document === "undefined") return;

  const { Tooltip } = getBootstrap();
  if (!Tooltip) return;

  const tooltipElements = document.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]');

  let activeTrigger: HTMLElement | null = null;
  let activeInstance: BsTooltipInstance | null = null;

  const closeActiveTooltip = (): void => {
    if (!activeInstance || !activeTrigger) return;

    activeInstance.hide();
    activeTrigger.setAttribute("aria-expanded", "false");

    activeInstance = null;
    activeTrigger = null;
  };

  tooltipElements.forEach((el) => {
    const contentId = el.getAttribute("data-tooltip-content-id");
    const contentEl = contentId ? document.getElementById(contentId) : null;

    const tooltipTitle =
      contentEl?.innerHTML.trim() ||
      el.getAttribute("data-bs-title") ||
      el.getAttribute("title") ||
      "";

    if (!tooltipTitle) return;

    el.setAttribute("aria-expanded", "false");

    const tooltipOptions: BsTooltipOptions = {
      html: true,
      container: "body",
      trigger: "manual",
      title: tooltipTitle,
      offset: [0, 4],
    };

    const instance = Tooltip.getOrCreateInstance
      ? Tooltip.getOrCreateInstance(el, tooltipOptions)
      : new Tooltip(el, tooltipOptions);

    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isSameTooltipOpen = activeTrigger === el;

      if (activeInstance && activeTrigger && activeTrigger !== el) {
        closeActiveTooltip();
      }

      if (isSameTooltipOpen) {
        closeActiveTooltip();
        return;
      }

      instance.show();
      el.setAttribute("aria-expanded", "true");
      activeTrigger = el;
      activeInstance = instance;
    });
  });

  document.addEventListener("click", (event) => {
    if (!activeTrigger || !activeInstance) return;

    const target = event.target as Node;
    const activeTooltipEl = document.querySelector(".tooltip.show");

    const clickedTrigger = activeTrigger.contains(target);
    const clickedTooltip = activeTooltipEl?.contains(target) ?? false;

    if (!clickedTrigger && !clickedTooltip) {
      closeActiveTooltip();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeActiveTooltip();
    }
  });

  document.addEventListener("hidden.bs.tooltip", (event) => {
    const target = event.target as HTMLElement;

    if (activeTrigger === target) {
      activeTrigger.setAttribute("aria-expanded", "false");
      activeTrigger = null;
      activeInstance = null;
    }
  });
};

export const initBootstrapToasts = (): void => {

  if (typeof document === "undefined") {
    return;
  }

  const { Toast } = getBootstrap();
  if (!Toast) return;

  const toasts = document.querySelectorAll<HTMLElement>(".toast");

  if (!toasts.length) {
    return;
  }

  toasts.forEach((el) => {
    if (Toast.getOrCreateInstance) {
      Toast.getOrCreateInstance(el, {
        animation: true,
        autohide: true,
        delay: 3000,
      });
    } else {
      new Toast(el, {
        animation: true,
        autohide: true,
        delay: 3000,
      });
    }


  });
};


export const initBootstrapComponents = (): void => {
  initBootstrapCollapse();
  initBootstrapModal();
  initBootstrapTabs();
  initBootstrapTooltips();
  initBootstrapToasts();
};
