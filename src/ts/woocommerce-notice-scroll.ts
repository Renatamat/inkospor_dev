type JQueryWithWooNoticeScroll = {
  scroll_to_notices?: (scrollElement?: unknown) => void;
};

type WindowWithJQuery = typeof window & {
  jQuery?: JQueryWithWooNoticeScroll;
};

const disableWooCommerceNoticeScroll = (): void => {
  const win = window as WindowWithJQuery;

  if (!win.jQuery) {
    return;
  }

  win.jQuery.scroll_to_notices = () => undefined;
};

export const initWooCommerceNoticeScrollGuard = (): void => {
  if (document.body.dataset.inkospornovaNoticeScrollGuardInitialized === "true") return;

  document.body.dataset.inkospornovaNoticeScrollGuardInitialized = "true";

  disableWooCommerceNoticeScroll();

  window.setTimeout(disableWooCommerceNoticeScroll, 0);
  window.setTimeout(disableWooCommerceNoticeScroll, 250);
};
