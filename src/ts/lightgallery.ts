import lightGallery from "lightgallery";

type LightGalleryEl = HTMLElement & { dataset: DOMStringMap };

const instances: Array<ReturnType<typeof lightGallery>> = [];

const safeJson = <T>(value?: string, fallback?: T): T => {
  if (!value) return fallback as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback as T;
  }
};

export const initLightGalleries = (root: ParentNode = document): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<LightGalleryEl>("[data-lightgallery-config]").forEach((el) => {
    if (el.closest("[data-mobile-portal-source]")) return;
    if (el.dataset.lightgalleryInitialized === "true") return;

    const options = safeJson<Record<string, unknown>>(
      el.dataset.lightgalleryConfig,
      {},
    );

    const instance = lightGallery(el, options);
    instances.push(instance);
    el.dataset.lightgalleryInitialized = "true";
  });
};

export const destroyLightGalleries = (): void => {
  instances.forEach((instance) => instance.destroy());
  instances.length = 0;
};
