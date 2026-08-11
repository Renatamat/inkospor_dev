import { initFloatSidebars } from "./float-sidebar";
import { initLightGalleries } from "./lightgallery";
import { initSwipers } from "./swiper";
import { initFormHandlers } from "./forms"; 
import { initAccordion } from "./accordion";
import { initHeader } from "./header";
import { initBootstrapCollapse } from "./bootstrap";
import { initBootstrapModal } from "./bootstrap";
import { initBootstrapTabs } from "./bootstrap";
import { initBootstrapTooltips } from "./bootstrap";
import { initBootstrapToasts } from "./bootstrap";
import { initToast } from "./toast";
import { initBootstrapPlaceholders } from "./placeholders";
import { initProductBottomBar } from "./product-bottom-bar";
import { initCartDrawer } from "./cart-toggle";
import { initArchiveFilters } from "./archive-filters";
import { initWooCommerceNoticeScrollGuard } from "./woocommerce-notice-scroll";



const initAll = () => {
  initHeader();
  initFloatSidebars();
  initLightGalleries();
  initSwipers();
  initFormHandlers(); 
  initAccordion();
  initBootstrapCollapse();
  initBootstrapModal();
  initBootstrapTabs();
  initBootstrapTooltips();
  initBootstrapToasts();
  initBootstrapPlaceholders();
  initProductBottomBar();
  initCartDrawer();
  initWooCommerceNoticeScrollGuard();
  initArchiveFilters();
  initToast();
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
export { initBootstrapCollapse };
export { initBootstrapModal };
export { initBootstrapTabs };
export { initBootstrapTooltips };
export { initBootstrapToasts };
export { initToast };
export { initProductBottomBar };
export { initCartDrawer };
export { initArchiveFilters };
export { initWooCommerceNoticeScrollGuard };
export const isPatternlabWebpackReady = true;
