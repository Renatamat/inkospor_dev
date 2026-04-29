declare module "float-sidebar" {
  type FloatSidebarOptions = {
    sidebar: HTMLElement;
    relative: HTMLElement;
    viewport?: HTMLElement | Window;
    sidebarInner?: HTMLElement;
    topSpacing?: number;
    bottomSpacing?: number;
  };

  type FloatSidebarInstance = {
    forceUpdate: () => void;
    destroy: () => void;
  };

  export default function FloatSidebar(
    options: FloatSidebarOptions,
  ): FloatSidebarInstance;
}
