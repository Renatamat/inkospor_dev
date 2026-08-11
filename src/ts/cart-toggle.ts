const getDrawerElements = () => {
  const drawer = document.querySelector<HTMLElement>(".c-cart-drawer");
  const toggles = document.querySelectorAll<HTMLElement>(".cart-toggle");

  return {
    drawer,
    toggles,
  };
};

const closeMobileMenu = (): void => {
  const mobileMenu = document.querySelector<HTMLElement>(".headerMenu.--showMobile");
  const hamburger = document.querySelector<HTMLElement>(".headerMainHamburger .c-btn");
  const primaryHeader = document.querySelector<HTMLElement>(".primaryHeader");

  mobileMenu?.classList.remove("--showMobile");
  mobileMenu?.setAttribute("aria-hidden", "true");
  hamburger?.setAttribute("aria-expanded", "false");
  primaryHeader?.classList.remove("--openMenu");
};

export const openCartDrawer = (): void => {
  const { drawer, toggles } = getDrawerElements();
  if (!drawer) return;

  closeMobileMenu();
  drawer.classList.add("--show");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-drawer-open");

  toggles.forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "true");
  });
};

export const closeCartDrawer = (): void => {
  const { drawer, toggles } = getDrawerElements();
  if (!drawer) return;

  drawer.classList.remove("--show");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-drawer-open");

  toggles.forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
  });
};

export const initCartDrawer = (): void => {
  const { drawer } = getDrawerElements();

  if (drawer && drawer.dataset.cartDrawerBackdropBound !== "true") {
    drawer.addEventListener("click", (event) => {
      if (event.target === drawer) {
        closeCartDrawer();
      }
    });

    drawer.dataset.cartDrawerBackdropBound = "true";
  }

  if (document.body.dataset.cartDrawerDelegatedBound !== "true") {
    document.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      const toggle = target?.closest<HTMLElement>(".cart-toggle");
      const closeButton = target?.closest<HTMLElement>(".cart-close");

      if (!toggle && !closeButton) return;

      event.preventDefault();

      if (closeButton) {
        closeCartDrawer();
        return;
      }

      const currentDrawer = document.querySelector<HTMLElement>(".c-cart-drawer");
      if (!currentDrawer) return;

      if (currentDrawer.classList.contains("--show")) {
        closeCartDrawer();
        return;
      }

      openCartDrawer();
    });

    document.body.dataset.cartDrawerDelegatedBound = "true";
  }

  if (document.body.dataset.cartDrawerEscBound !== "true") {
    document.addEventListener("keydown", (event) => {
      const currentDrawer = document.querySelector<HTMLElement>(".c-cart-drawer");

      if (event.key === "Escape" && currentDrawer?.classList.contains("--show")) {
        closeCartDrawer();
      }
    });

    document.body.dataset.cartDrawerEscBound = "true";
  }
};
