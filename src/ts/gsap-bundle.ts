// src/ts/gsap-bundle.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { initHomepageCertAnimations } from "./homepage-cert";
import { initHomepageIngredientsWater } from "./homepage-ingredients-water";
import { initHomepageGoalsScroll } from "./homepage-goals-scroll";
import { initHomepageGoalsImages } from "./homepage-goals-images";
import { initHomepageGmpAnimations } from "./homepage-gmp";
import { initHomepageProdAnimations } from "./homepage-prod";
import { initHomepageQualityAnimations } from "./homepage-quality";
import { initHomepageExpertsAnimations } from "./homepage-experts";
import { initHomepageMigAnimations } from "./homepage-mig";
import { initHomepageSliderAnimations } from "./homepage-slider-animations";

// Zarejestruj pluginy
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Eksportuj do window
declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }
}

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

/* ============================================
   ANIMACJA 1: Fade In + Slide Up
   ============================================ */
const initFadeInUp = () => {
  const elements = document.querySelectorAll("[data-animate='fade-in-up']");
  
  elements.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 80,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
        //markers: true, // Odkomentuj aby zobaczyć triggery (debugging)
      },
    });
  });
};

/* ============================================
   ANIMACJA 2: Scale In (powiększenie)
   ============================================ */
const initScaleIn = () => {
  const elements = document.querySelectorAll("[data-animate='scale-in']");
  
  elements.forEach((el) => {
    gsap.from(el, {
      scale: 0.5,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });
};

/* ============================================
   ANIMACJA 3: Slide From Left
   ============================================ */
const initSlideFromLeft = () => {
  const elements = document.querySelectorAll("[data-animate='slide-left']");
  
  elements.forEach((el) => {
    gsap.from(el, {
      x: -100,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });
};

/* ============================================
   ANIMACJA 4: Staggered Cards (po kolei)
   ============================================ */
const initStaggeredCards = () => {
  const containers = document.querySelectorAll("[data-animate-stagger]");
  
  containers.forEach((container) => {
    const cards = container.querySelectorAll("[data-stagger-item]");
    
    gsap.from(cards, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.15, // Opóźnienie między każdym elementem
      ease: "power2.out",
      scrollTrigger: {
        trigger: container,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
  });
};

/* ============================================
   ANIMACJA 5: Parallax Background
   ============================================ */
const initParallax = () => {
  const elements = document.querySelectorAll("[data-animate='parallax']");
  
  elements.forEach((el) => {
    gsap.to(el, {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true, // Płynne powiązanie ze scrollem
      },
    });
  });
};

/* ============================================
   ANIMACJA 6: Counter (licznik)
   ============================================ */
const initCounters = () => {
  const counters = document.querySelectorAll("[data-animate='counter']");
  
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-target") || "0", 10);
    
    const obj = { value: 0 };
    
    gsap.to(obj, {
      value: target,
      duration: 2,
      ease: "power1.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onUpdate: function() {
        counter.textContent = Math.round(obj.value).toString();
      },
    });
  });
};

/* ============================================
   INIT ALL
   ============================================ */
export const initGsapAnimations = () => {
  console.log("🎬 GSAP animations initialized");
  
  initFadeInUp();
  initScaleIn();
  initSlideFromLeft();
  initStaggeredCards();
  initParallax();
  initCounters();
  initHomepageSliderAnimations();
  initHomepageCertAnimations();
  initHomepageIngredientsWater();
  initHomepageGoalsScroll();
  initHomepageGoalsImages();
  initHomepageGmpAnimations();
  initHomepageProdAnimations();
  initHomepageQualityAnimations();
  initHomepageExpertsAnimations();
  initHomepageMigAnimations();

  requestAnimationFrame(() => ScrollTrigger.refresh());
};

// Auto-init
const setup = () => {
  if (typeof document === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGsapAnimations);
    return;
  }

  initGsapAnimations();
};

setup();

window.addEventListener("load", () => ScrollTrigger.refresh());

export const isGsapBundleReady = true;
