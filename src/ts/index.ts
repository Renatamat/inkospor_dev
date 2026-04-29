import FloatSidebar from "float-sidebar";
import { initLightGalleries } from "./lightgallery";
import { initSwipers } from "./swiper";
import { initFormHandlers } from "./forms"; 
import { initAccordion } from "./accordion";

const defaultTopSpacing = 20; 
const defaultBottomSpacing = 20;

const floatSidebars: Array<ReturnType<typeof FloatSidebar>> = [];

const parseSpacing = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const initFloatSidebars = () => {
  const sidebars = document.querySelectorAll<HTMLElement>("[data-float-sidebar]");

  sidebars.forEach((sidebar) => {
    const wrapper = sidebar.closest<HTMLElement>("[data-float-sidebar-wrapper]");
    const relative =
      wrapper?.querySelector<HTMLElement>("[data-float-sidebar-relative]") ?? null;

    if (!relative) return; 

    const topSpacing = parseSpacing(
      wrapper?.dataset.floatSidebarTopSpacing,
      defaultTopSpacing,
    );
    const bottomSpacing = parseSpacing(
      wrapper?.dataset.floatSidebarBottomSpacing,
      defaultBottomSpacing,
    );

    floatSidebars.push(
      FloatSidebar({
        sidebar,
        relative,
        topSpacing,
        bottomSpacing,
      }),
    );
  });
};

const initAll = () => {
  initFloatSidebars();
  initLightGalleries();
  initSwipers();
  initFormHandlers(); 
  initAccordion();
};

const setup = () => {
  if (typeof document === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
    return;
  }

  initAll();
};

setup();

export { initFloatSidebars };
export { initLightGalleries };
export { initSwipers };
export { initFormHandlers }; 
export const isPatternlabWebpackReady = true;