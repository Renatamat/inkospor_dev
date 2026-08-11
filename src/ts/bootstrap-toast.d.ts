declare module "bootstrap/js/dist/toast" {
  type ToastOptions = {
    animation?: boolean;
    autohide?: boolean;
    delay?: number;
  };

  export default class Toast {
    constructor(element: Element, options?: ToastOptions);

    show(): void;
    hide(): void;
    dispose(): void;

    static getInstance(element: Element): Toast | null;
    static getOrCreateInstance(element: Element, options?: ToastOptions): Toast;
  }
}
