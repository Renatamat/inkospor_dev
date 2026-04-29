import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

type SwiperEl = HTMLElement & { swiper?: Swiper };

const instances: Swiper[] = [];

/* custom actions */
const swiperActions: Record<string, (swiper: Swiper) => void> = {
  "change-second-slide-bg": (swiper) => {
    const slide = swiper.slides[1];
    if (!slide) return;
    slide.style.background = "yellow";
  },
  "change-second-slide-bg-2": (swiper) => {
    const slide = swiper.slides[1];
    if (!slide) return;
    slide.style.background = "black";
  },
};

const safeJson = <T>(value?: string, fallback?: T): T => {
  if (!value) return fallback as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback as T;
  }
};

export const initSwipers = (root: ParentNode = document): void => {
  if (typeof document === "undefined") return;

  root.querySelectorAll<SwiperEl>("[data-swiper]").forEach((el) => {
    if (el.closest("[data-mobile-portal-source]")) return;
    if (el.swiper) return;

    const options = safeJson<Record<string, any>>(
      el.dataset.swiperOptions,
      {},
    );

    const nextEl = el.querySelector<HTMLElement>(".swiper-button-next");
    const prevEl = el.querySelector<HTMLElement>(".swiper-button-prev");
    const pagEl = el.querySelector<HTMLElement>(".swiper-pagination");

    const onNextAction = el.dataset.onNext;

    const instance = new Swiper(el, {
      modules: [Navigation, Pagination, Autoplay],
      ...options,

      navigation:
        options.navigation ??
        (nextEl && prevEl ? { nextEl, prevEl } : false),

      pagination:
        options.pagination ??
        (pagEl ? { el: pagEl, clickable: true } : false),

      on: {
        slideNextTransitionStart(swiper) {
          if (!onNextAction) return;
          swiperActions[onNextAction]?.(swiper);
        },
      },
    });

    instances.push(instance);
  });
};

export const destroySwipers = (): void => {
  instances.forEach((s) => s.destroy(true, true));
  instances.length = 0;
};
