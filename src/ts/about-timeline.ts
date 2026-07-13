import gsap from "gsap";

const initializedTimelines = new WeakSet<HTMLElement>();

export const initAboutTimelineAnimations = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>(".about-timeline").forEach((timeline) => {
    if (initializedTimelines.has(timeline)) return;

    const rows = Array.from(
      timeline.querySelectorAll<HTMLElement>(".about-timeline-row"),
    );
    const dotItems = rows
      .map((row) => row.querySelector<HTMLElement>(".about-timeline-text"))
      .filter((item): item is HTMLElement => Boolean(item));
    if (!rows.length) return;

    initializedTimelines.add(timeline);
    let progress = timeline.querySelector<HTMLElement>(".about-timeline-progress");
    if (!progress) {
      progress = document.createElement("div");
      progress.className = "about-timeline-progress";
      timeline.prepend(progress);
    }

    gsap.killTweensOf(rows);
    gsap.killTweensOf(progress);
    gsap.killTweensOf(
      rows.flatMap((row) =>
        Array.from(row.querySelectorAll<HTMLElement>(".about-timeline-date")),
      ),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(rows, {
        autoAlpha: 1,
        clearProps: "opacity,visibility",
      });
      gsap.set(progress, {
        scaleY: 1,
      });
      timeline.classList.add("--progress-started");
      dotItems.forEach((dotItem) => {
        dotItem.classList.add("--active");
      });
      timeline
        .querySelector<HTMLElement>(".about-timeline-enddot")
        ?.classList.add("--active");
      rows.forEach((row) => {
        const date = row.querySelector<HTMLElement>(".about-timeline-date");
        if (!date) return;

        gsap.set(date, {
          autoAlpha: 1,
          clearProps: "opacity,visibility,transform",
        });
      });
      return;
    }

    gsap.set(rows, {
      autoAlpha: 0,
    });
    gsap.set(progress, {
      scaleY: 0,
      transformOrigin: "top center",
    });
    dotItems.forEach((dotItem) => {
      dotItem.classList.remove("--active");
    });
    timeline.classList.remove("--progress-started");
    const endDot = timeline.querySelector<HTMLElement>(".about-timeline-enddot");
    endDot?.classList.remove("--active");
    const activeDotItems = new Set<HTMLElement>();

    const pulseDot = (dotItem: HTMLElement) => {
      gsap.killTweensOf(dotItem, "--timeline-dot-scale");
      gsap.fromTo(
        dotItem,
        {
          "--timeline-dot-scale": 1,
        },
        {
          "--timeline-dot-scale": 1.45,
          duration: 0.16,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.set(dotItem, {
              "--timeline-dot-scale": 1,
            });
          },
        },
      );
    };

    const updateActiveDots = () => {
      const progressRect = progress.getBoundingClientRect();
      const progressEnd = progressRect.bottom;

      dotItems.forEach((dotItem) => {
        const dotRect = dotItem.getBoundingClientRect();
        const dotCenter = dotRect.top + dotRect.height / 2;
        const shouldBeActive = progressEnd >= dotCenter;

        if (shouldBeActive && !activeDotItems.has(dotItem)) {
          activeDotItems.add(dotItem);
          dotItem.classList.add("--active");
          pulseDot(dotItem);
        }

        if (!shouldBeActive && activeDotItems.has(dotItem)) {
          activeDotItems.delete(dotItem);
          dotItem.classList.remove("--active");
          gsap.set(dotItem, {
            "--timeline-dot-scale": 1,
          });
        }
      });

      if (endDot) {
        const endDotRect = endDot.getBoundingClientRect();
        const endDotCenter = endDotRect.top + endDotRect.height / 2;
        const shouldBeActive = progressEnd >= endDotCenter;

        if (shouldBeActive && !activeDotItems.has(endDot)) {
          activeDotItems.add(endDot);
          endDot.classList.add("--active");
          pulseDot(endDot);
        }

        if (!shouldBeActive && activeDotItems.has(endDot)) {
          activeDotItems.delete(endDot);
          endDot.classList.remove("--active");
          gsap.set(endDot, {
            "--timeline-dot-scale": 1,
          });
        }
      }
    };

    gsap.to(progress, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: timeline,
        start: "top center",
        end: "bottom center",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          timeline.classList.toggle("--progress-started", self.progress > 0.001);
          updateActiveDots();
        },
        onRefresh: (self) => {
          timeline.classList.toggle("--progress-started", self.progress > 0.001);
          updateActiveDots();
        },
      },
    });

    rows.forEach((row) => {
      const date = row.querySelector<HTMLElement>(".about-timeline-date");
      const dateWrapper = date?.parentElement;
      const dateDirection = dateWrapper?.classList.contains("about-timeline-right")
        ? 36
        : -36;

      if (date) {
        gsap.set(date, {
          autoAlpha: 0,
          x: dateDirection,
        });
      }

      const rowTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 72%",
          once: true,
        },
      });

      rowTimeline.to(row, {
        autoAlpha: 1,
        duration: 0.64,
        ease: "power1.out",
        onComplete: () => {
          gsap.set(row, {
            clearProps: "opacity,visibility",
          });
        },
      });

      if (date) {
        rowTimeline.to(
          date,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.58,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(date, {
                clearProps: "opacity,visibility,transform",
              });
            },
          },
          0.18,
        );
      }
    });
  });
};
