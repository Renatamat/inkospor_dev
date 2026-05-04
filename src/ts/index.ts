import { initFloatSidebars } from "./float-sidebar";
import { initLightGalleries } from "./lightgallery";
import { initSwipers } from "./swiper";
import { initFormHandlers } from "./forms"; 
import { initAccordion } from "./accordion";
import { initHeader } from "./header";


const initAll = () => {
  initHeader();
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
export { initHeader };
export { initFloatSidebars };
export { initLightGalleries };
export { initSwipers };
export { initFormHandlers }; 
export const isPatternlabWebpackReady = true;