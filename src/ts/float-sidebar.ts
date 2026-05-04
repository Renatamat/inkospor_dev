// @ts-ignore
import FloatSidebar from "./helpers/float-sidebar/src/float-sidebar";

const defaultTopSpacing = 20;
const defaultBottomSpacing = 20;
const defaultMinWidth = 992;

const floatSidebars: Array<{ instance: ReturnType<typeof FloatSidebar>; minWidth: number }> = [];

const parseSpacing = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const initFloatSidebars = (): void => {
  const sidebars = document.querySelectorAll<HTMLElement>("[data-float-sidebar]");

  sidebars.forEach((sidebar) => {
    const wrapper = sidebar.closest<HTMLElement>("[data-float-sidebar-wrapper]");
    const relative = wrapper?.querySelector<HTMLElement>("[data-float-sidebar-relative]") ?? null;

    if (!relative) return;

    const topSpacing = parseSpacing(wrapper?.dataset.floatSidebarTopSpacing, defaultTopSpacing);
    const bottomSpacing = parseSpacing(wrapper?.dataset.floatSidebarBottomSpacing, defaultBottomSpacing);
    const minWidth = parseSpacing(wrapper?.dataset.floatSidebarMinWidth, defaultMinWidth);

    if (window.innerWidth < minWidth) return;

    floatSidebars.push({
      instance: FloatSidebar({ sidebar, relative, topSpacing, bottomSpacing }),
      minWidth,
    });
  });

  // niszczymy instancje gdy okno zwęzi się poniżej minWidth
  window.addEventListener("resize", () => {
    floatSidebars.forEach(({ instance, minWidth }) => {
      if (window.innerWidth < minWidth) {
        instance.destroy();
      }
    });
  });
};