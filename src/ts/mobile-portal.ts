import { initLightGalleries } from "./lightgallery";
import { initSwipers } from "./swiper";

const MOBILE_PORTAL_BREAKPOINT = 600;
const MOBILE_PORTAL_ID = "mobile-portal";
const BODY_OPEN_CLASS = "mobile-portal-open";
const PORTAL_VISIBLE_CLASS = "--visible";
const PORTAL_CLOSING_CLASS = "--closing";
const PORTAL_SELECT_MODE_CLASS = "--select-mode";
const PORTAL_CONTENT_MODE_CLASS = "--content-mode";
const PORTAL_FULL_HEIGHT_CLASS = "--full-height";
const CLOSE_ANIMATION_MS = 420;
const DEFAULT_CONFIRM_TEXT = "Wybierz";

type MobileSelectOption = {
  value: string;
  label: string;
  disabled: boolean;
  selected: boolean;
};

type SelectPortalState = {
  type: "select";
  select: HTMLSelectElement;
  options: MobileSelectOption[];
  draftValue: string;
};

type ContentPortalState = {
  type: "content";
  trigger: HTMLElement;
  contentId: string;
  confirmAction?: string;
};

type MobilePortalState = SelectPortalState | ContentPortalState;

type MobilePortalLayerSnapshot = {
  state: MobilePortalState;
  title: string;
  bodyFragment: DocumentFragment;
  isSelectMode: boolean;
  isContentMode: boolean;
  isFullHeight: boolean;
  footerHidden: boolean;
  confirmText: string;
  confirmAction?: string;
  focusOrigin: HTMLElement | null;
};

class MobilePortal {
  private portal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private sheet: HTMLElement | null = null;
  private handle: HTMLElement | null = null;
  private panelTitle: HTMLElement | null = null;
  private stage: HTMLElement | null = null;
  private layerPreview: HTMLElement | null = null;
  private layerShadow: HTMLElement | null = null;
  private layerContent: HTMLElement | null = null;
  private panelBody: HTMLElement | null = null;
  private footer: HTMLElement | null = null;
  private cancelButton: HTMLButtonElement | null = null;
  private confirmButton: HTMLButtonElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private nested: HTMLElement | null = null;
  private nestedSheet: HTMLElement | null = null;
  private nestedTitle: HTMLElement | null = null;
  private nestedBody: HTMLElement | null = null;
  private nestedFooter: HTMLElement | null = null;
  private nestedCancelButton: HTMLButtonElement | null = null;
  private nestedConfirmButton: HTMLButtonElement | null = null;
  private nestedCloseButton: HTMLButtonElement | null = null;
  private activeState: MobilePortalState | null = null;
  private nestedState: SelectPortalState | null = null;
  private stateStack: MobilePortalLayerSnapshot[] = [];
  private lastFocusedElement: HTMLElement | null = null;
  private closeTimeout: number | null = null;
  private dragPointerId: number | null = null;
  private dragStartY = 0;
  private dragOffsetY = 0;
  private isDragging = false;

  constructor() {
    if (typeof document === "undefined") return;
    this.bindTriggerDelegation();
  }

  public isEnabled(): boolean {
    return typeof window !== "undefined" && window.innerWidth < MOBILE_PORTAL_BREAKPOINT;
  }

  public openSelect(select: HTMLSelectElement, trigger: HTMLElement): void {
    if (!this.isEnabled()) return;

    this.ensurePortal();
    if (!this.portal || !this.panelTitle || !this.panelBody) return;

    if (this.activeState?.type === "content" && this.nested && this.nestedTitle && this.nestedBody) {
      const options = this.getOptions(select);
      const selectedOption = options.find((option) => option.selected && !option.disabled);
      const fallbackOption = options.find((option) => !option.disabled);
      const draftValue = selectedOption?.value ?? fallbackOption?.value ?? "";

      this.nestedState = {
        type: "select",
        select,
        options,
        draftValue,
      };

      this.nestedTitle.textContent = this.getSelectLabel(select);
      this.renderNestedSelectOptions();
      this.showNestedSelect();
      return;
    }

    this.pushCurrentLayer();

    const options = this.getOptions(select);
    const selectedOption = options.find((option) => option.selected && !option.disabled);
    const fallbackOption = options.find((option) => !option.disabled);
    const draftValue = selectedOption?.value ?? fallbackOption?.value ?? "";

    this.activeState = {
      type: "select",
      select,
      options,
      draftValue,
    };

    this.setFocusOrigin(trigger);
    this.panelTitle.textContent = this.getSelectLabel(select);
    this.portal.classList.remove(PORTAL_CONTENT_MODE_CLASS);
    this.portal.classList.add(PORTAL_SELECT_MODE_CLASS);
    this.portal.classList.toggle(
      PORTAL_FULL_HEIGHT_CLASS,
      select.hasAttribute("data-mobile-portal-full-height"),
    );
    this.configureFooter({
      showFooter: true,
      confirmText: DEFAULT_CONFIRM_TEXT,
    });
    this.renderSelectOptions();
    this.presentLayer();
    this.confirmButton?.focus();
  }

  public openContent(trigger: HTMLElement): void {
    if (!this.isEnabled()) return;

    this.ensurePortal();
    if (!this.portal || !this.panelTitle || !this.panelBody) return;

    const contentId = trigger.dataset.mobilePortalContentId;
    if (!contentId) return;

    const sourceContent = document.getElementById(contentId);
    if (!sourceContent) return;
    this.pushCurrentLayer();

    const confirmAction = trigger.dataset.mobilePortalConfirmAction?.trim() || undefined;

    this.activeState = {
      type: "content",
      trigger,
      contentId,
      confirmAction,
    };

    this.setFocusOrigin(trigger);
    this.panelTitle.textContent =
      trigger.dataset.mobilePortalTitle ||
      trigger.getAttribute("aria-label") ||
      "Szczegoly";

    this.portal.classList.remove(PORTAL_SELECT_MODE_CLASS);
    this.portal.classList.add(PORTAL_CONTENT_MODE_CLASS);
    this.portal.classList.toggle(
      PORTAL_FULL_HEIGHT_CLASS,
      trigger.hasAttribute("data-mobile-portal-full-height"),
    );
    this.configureFooter({
      showFooter: Boolean(confirmAction),
      confirmText: trigger.dataset.mobilePortalConfirmText || DEFAULT_CONFIRM_TEXT,
      confirmAction,
    });
    this.renderContentBody(sourceContent);
    this.presentLayer();
    if (confirmAction) {
      this.confirmButton?.focus();
    } else {
      this.closeButton?.focus();
    }
  }

  public close(returnFocus = true): void {
    if (this.hideNestedSelect()) {
      return;
    }

    if (this.restorePreviousLayer()) {
      return;
    }

    if (!this.portal) return;

    this.portal.classList.remove(PORTAL_VISIBLE_CLASS);
    this.portal.classList.add(PORTAL_CLOSING_CLASS);
    this.portal.setAttribute("aria-hidden", "true");
    document.body.classList.remove(BODY_OPEN_CLASS);
    this.activeState = null;

    if (this.closeTimeout !== null) {
      window.clearTimeout(this.closeTimeout);
    }

    this.closeTimeout = window.setTimeout(() => {
      if (!this.portal || !this.panelBody) return;
      this.portal.hidden = true;
      this.portal.classList.remove(PORTAL_CLOSING_CLASS);
      this.portal.classList.remove(PORTAL_SELECT_MODE_CLASS);
      this.portal.classList.remove(PORTAL_CONTENT_MODE_CLASS);
      this.portal.classList.remove(PORTAL_FULL_HEIGHT_CLASS);
      this.resetFooter();
      this.panelBody.innerHTML = "";
      this.clearStackedPreview();
      this.stateStack = [];
      this.closeTimeout = null;
    }, CLOSE_ANIMATION_MS);

    if (returnFocus) {
      this.lastFocusedElement?.focus();
    }
  }

  private bindTriggerDelegation(): void {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("[data-mobile-portal-trigger]");
      if (!trigger || !this.isEnabled()) return;

      event.preventDefault();
      this.openContent(trigger);
    });
  }

  private setFocusOrigin(trigger: HTMLElement): void {
    this.lastFocusedElement = trigger;
  }

  private presentLayer(): void {
    if (!this.portal) return;

    this.resetDragStyles();

    if (!this.portal.hidden) {
      return;
    }

    if (this.closeTimeout !== null) {
      window.clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    this.portal.hidden = false;
    this.portal.setAttribute("aria-hidden", "false");
    this.portal.classList.remove(PORTAL_CLOSING_CLASS);
    document.body.classList.add(BODY_OPEN_CLASS);

    window.requestAnimationFrame(() => {
      this.portal?.classList.add(PORTAL_VISIBLE_CLASS);
    });

    this.animateLayerIn();
  }

  private pushCurrentLayer(): void {
    if (!this.portal || !this.panelTitle || !this.panelBody || !this.activeState) return;

    const bodyFragment = document.createDocumentFragment();

    if (this.layerPreview) {
      const previewContent = document.createElement("div");
      previewContent.className = "mobile-portal__preview-content";
      previewContent.innerHTML = this.panelBody.innerHTML;

      this.layerPreview.innerHTML = "";
      this.layerPreview.appendChild(previewContent);
      this.portal.classList.add("--stacked");
    }

    if (this.sheet) {
      this.sheet.style.height = `${this.sheet.offsetHeight}px`;
    }

    if (this.stage) {
      this.stage.style.height = "";
    }

    while (this.panelBody.firstChild) {
      bodyFragment.appendChild(this.panelBody.firstChild);
    }

    this.stateStack.push({
      state: this.activeState,
      title: this.panelTitle.textContent || "",
      bodyFragment,
      isSelectMode: this.portal.classList.contains(PORTAL_SELECT_MODE_CLASS),
      isContentMode: this.portal.classList.contains(PORTAL_CONTENT_MODE_CLASS),
      isFullHeight: this.portal.classList.contains(PORTAL_FULL_HEIGHT_CLASS),
      footerHidden: this.footer?.hidden ?? false,
      confirmText: this.confirmButton?.textContent || DEFAULT_CONFIRM_TEXT,
      confirmAction: this.confirmButton?.dataset.mobilePortalConfirmAction || undefined,
      focusOrigin: this.lastFocusedElement,
    });
  }

  private restorePreviousLayer(): boolean {
    if (!this.portal || !this.panelTitle || !this.panelBody) return false;

    const previousLayer = this.stateStack.pop();
    if (!previousLayer) return false;

    this.activeState = previousLayer.state;
    this.lastFocusedElement = previousLayer.focusOrigin;
    this.panelTitle.textContent = previousLayer.title;
    this.panelBody.innerHTML = "";
    this.panelBody.appendChild(previousLayer.bodyFragment);

    this.portal.classList.toggle(PORTAL_SELECT_MODE_CLASS, previousLayer.isSelectMode);
    this.portal.classList.toggle(PORTAL_CONTENT_MODE_CLASS, previousLayer.isContentMode);
    this.portal.classList.toggle(PORTAL_FULL_HEIGHT_CLASS, previousLayer.isFullHeight);

    this.configureFooter({
      showFooter: !previousLayer.footerHidden,
      confirmText: previousLayer.confirmText,
      confirmAction: previousLayer.confirmAction,
    });

    this.clearStackedPreview();

    if (previousLayer.state.type === "select") {
      this.confirmButton?.focus();
    } else if (!previousLayer.footerHidden && previousLayer.state.confirmAction) {
      this.confirmButton?.focus();
    } else {
      this.closeButton?.focus();
    }

    return true;
  }

  private animateLayerIn(): void {
    if (!this.layerContent) return;

    this.layerContent.classList.remove("--entering");
    void this.layerContent.offsetWidth;
    this.layerContent.classList.add("--entering");

    window.setTimeout(() => {
      this.layerContent?.classList.remove("--entering");
    }, 320);
  }

  private clearStackedPreview(): void {
    if (!this.portal || !this.layerPreview) return;

    this.portal.classList.remove("--stacked");
    this.layerPreview.innerHTML = "";

    if (this.sheet) {
      this.sheet.style.height = "";
    }

    if (this.stage) {
      this.stage.style.height = "";
    }
  }

  private ensurePortal(): void {
    if (this.portal) return;
    if (!document.body) return;

    const existingPortal = document.getElementById(MOBILE_PORTAL_ID);
    if (existingPortal) {
      this.portal = existingPortal;
      this.backdrop = existingPortal.querySelector(".mobile-portal__backdrop");
      this.sheet = existingPortal.querySelector(".mobile-portal__sheet");
      this.handle = existingPortal.querySelector(".mobile-portal__handle");
      this.panelTitle = existingPortal.querySelector(".mobile-portal__title");
      this.stage = existingPortal.querySelector(".mobile-portal__stage");
      this.layerPreview = existingPortal.querySelector(".mobile-portal__layer-preview");
      this.layerShadow = existingPortal.querySelector(".mobile-portal__layer-shadow");
      this.layerContent = existingPortal.querySelector(".mobile-portal__layer-content");
      this.panelBody = existingPortal.querySelector(".mobile-portal__body");
      this.footer = existingPortal.querySelector(".mobile-portal__footer");
      this.cancelButton = existingPortal.querySelector(".mobile-portal__cancel");
      this.confirmButton = existingPortal.querySelector(".mobile-portal__confirm");
      this.closeButton = existingPortal.querySelector(".mobile-portal__close");
      this.nested = existingPortal.querySelector(".mobile-portal__nested");
      this.nestedSheet = existingPortal.querySelector(".mobile-portal__nested-sheet");
      this.nestedTitle = existingPortal.querySelector(".mobile-portal__nested-title");
      this.nestedBody = existingPortal.querySelector(".mobile-portal__nested-body");
      this.nestedFooter = existingPortal.querySelector(".mobile-portal__nested-footer");
      this.nestedCancelButton = existingPortal.querySelector(".mobile-portal__nested-cancel");
      this.nestedConfirmButton = existingPortal.querySelector(".mobile-portal__nested-confirm");
      this.nestedCloseButton = existingPortal.querySelector(".mobile-portal__nested-close");
      this.bindPortalEvents();
      return;
    }

    const portal = document.createElement("div");
    portal.id = MOBILE_PORTAL_ID;
    portal.className = "mobile-portal";
    portal.hidden = true;
    portal.setAttribute("aria-hidden", "true");

    portal.innerHTML = `
      <div class="mobile-portal__backdrop" data-mobile-portal-close></div>
      <div class="mobile-portal__sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-portal-title">
        <div class="mobile-portal__handle"></div>
        <div class="mobile-portal__header">
          <h3 class="mobile-portal__title" id="mobile-portal-title"></h3>
          <button class="mobile-portal__close" type="button" aria-label="Zamknij">&times;</button>
        </div>
        <div class="mobile-portal__stage">
          <div class="mobile-portal__layer-preview" aria-hidden="true"></div>
          <div class="mobile-portal__layer-shadow" aria-hidden="true"></div>
          <div class="mobile-portal__layer-content">
            <div class="mobile-portal__body"></div>
            <div class="mobile-portal__footer">
              <button class="mobile-portal__cancel" type="button">Anuluj</button>
              <button class="mobile-portal__confirm" type="button">Wybierz</button>
            </div>
          </div>
        </div>
        <div class="mobile-portal__nested" hidden>
          <div class="mobile-portal__nested-sheet">
            <div class="mobile-portal__header">
              <h3 class="mobile-portal__nested-title"></h3>
              <button class="mobile-portal__nested-close" type="button" aria-label="Zamknij">&times;</button>
            </div>
            <div class="mobile-portal__nested-body"></div>
            <div class="mobile-portal__nested-footer">
              <button class="mobile-portal__nested-cancel" type="button">Anuluj</button>
              <button class="mobile-portal__nested-confirm" type="button">Wybierz</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(portal);

    this.portal = portal;
    this.backdrop = portal.querySelector(".mobile-portal__backdrop");
    this.sheet = portal.querySelector(".mobile-portal__sheet");
    this.handle = portal.querySelector(".mobile-portal__handle");
    this.panelTitle = portal.querySelector(".mobile-portal__title");
    this.stage = portal.querySelector(".mobile-portal__stage");
    this.layerPreview = portal.querySelector(".mobile-portal__layer-preview");
    this.layerShadow = portal.querySelector(".mobile-portal__layer-shadow");
    this.layerContent = portal.querySelector(".mobile-portal__layer-content");
    this.panelBody = portal.querySelector(".mobile-portal__body");
    this.footer = portal.querySelector(".mobile-portal__footer");
    this.cancelButton = portal.querySelector(".mobile-portal__cancel");
    this.confirmButton = portal.querySelector(".mobile-portal__confirm");
    this.closeButton = portal.querySelector(".mobile-portal__close");
    this.nested = portal.querySelector(".mobile-portal__nested");
    this.nestedSheet = portal.querySelector(".mobile-portal__nested-sheet");
    this.nestedTitle = portal.querySelector(".mobile-portal__nested-title");
    this.nestedBody = portal.querySelector(".mobile-portal__nested-body");
    this.nestedFooter = portal.querySelector(".mobile-portal__nested-footer");
    this.nestedCancelButton = portal.querySelector(".mobile-portal__nested-cancel");
    this.nestedConfirmButton = portal.querySelector(".mobile-portal__nested-confirm");
    this.nestedCloseButton = portal.querySelector(".mobile-portal__nested-close");

    this.bindPortalEvents();
  }

  private bindPortalEvents(): void {
    this.portal?.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.matches("[data-mobile-portal-close]")) {
        this.close();
      }
    });

    this.closeButton?.addEventListener("click", () => {
      this.close();
    });

    this.cancelButton?.addEventListener("click", () => {
      this.close();
    });

    this.confirmButton?.addEventListener("click", () => {
      this.handleConfirm();
    });

    this.nestedCloseButton?.addEventListener("click", () => {
      this.hideNestedSelect();
    });

    this.nestedCancelButton?.addEventListener("click", () => {
      this.hideNestedSelect();
    });

    this.nestedConfirmButton?.addEventListener("click", () => {
      this.handleNestedConfirm();
    });

    this.handle?.addEventListener("pointerdown", (event) => {
      this.startDrag(event);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.activeState) {
        this.close();
      }
    });

    document.addEventListener("pointermove", (event) => {
      this.onDragMove(event);
    });

    document.addEventListener("pointerup", (event) => {
      this.endDrag(event);
    });

    document.addEventListener("pointercancel", (event) => {
      this.endDrag(event);
    });
  }

  private renderSelectOptions(): void {
    if (!this.panelBody || !this.activeState || this.activeState.type !== "select") return;

    const state = this.activeState;
    this.panelBody.innerHTML = "";

    const optionsList = document.createElement("div");
    optionsList.className = "mobile-portal__options";
    optionsList.setAttribute("role", "listbox");

    state.options.forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "mobile-portal__option";
      optionButton.textContent = option.label;
      optionButton.dataset.value = option.value;
      optionButton.setAttribute("role", "option");
      optionButton.setAttribute("aria-selected", String(state.draftValue === option.value));

      if (state.draftValue === option.value) {
        optionButton.classList.add("--selected");
      }

      if (option.disabled) {
        optionButton.disabled = true;
      }

      optionButton.addEventListener("click", () => {
        if (!this.activeState || this.activeState.type !== "select" || option.disabled) return;
        this.activeState.draftValue = option.value;
        this.renderSelectOptions();
      });

      optionsList.appendChild(optionButton);
    });

    this.panelBody.appendChild(optionsList);
  }

  private renderContentBody(sourceContent: HTMLElement): void {
    if (!this.panelBody) return;

    this.panelBody.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "mobile-portal__content";
    wrapper.innerHTML = sourceContent.innerHTML;

    wrapper.querySelectorAll<HTMLElement>('.custom-select').forEach((el) => {
      el.remove();
    });

    wrapper.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((el) => {
      delete el.dataset.formInitialized;
    });

    wrapper.querySelectorAll<HTMLSelectElement>('select').forEach((el) => {
      delete el.dataset.customSelectInitialized;
      el.style.display = '';
    });

    wrapper.querySelectorAll<HTMLFormElement>('form').forEach((el) => {
      delete el.dataset.formSubmitInitialized;
    });

    wrapper.querySelectorAll<HTMLElement>("[data-lightgallery-config]").forEach((el) => {
      delete el.dataset.lightgalleryInitialized;
    });

    this.panelBody.appendChild(wrapper);
    initSwipers(wrapper);
    initLightGalleries(wrapper);
    document.dispatchEvent(
      new CustomEvent("mobileportal:content-ready", {
        detail: {
          root: wrapper,
        },
      }),
    );
  }

  private handleConfirm(): void {
    if (!this.activeState) return;

    if (this.activeState.type === "select") {
      this.commitSelection();
      return;
    }

    if (!this.activeState.confirmAction) return;

    document.dispatchEvent(
      new CustomEvent("mobileportal:confirm", {
        detail: {
          action: this.activeState.confirmAction,
          contentId: this.activeState.contentId,
          trigger: this.activeState.trigger,
        },
      }),
    );

    this.close();
  }

  private handleNestedConfirm(): void {
    if (!this.nestedState) return;

    const { select, draftValue } = this.nestedState;

    if (select.value !== draftValue) {
      select.value = draftValue;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    this.hideNestedSelect();
  }

  private commitSelection(): void {
    if (!this.activeState || this.activeState.type !== "select") return;

    const { select, draftValue } = this.activeState;

    if (select.value !== draftValue) {
      select.value = draftValue;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    this.close();
  }

  private configureFooter(config: {
    showFooter: boolean;
    confirmText: string;
    confirmAction?: string;
  }): void {
    if (!this.footer || !this.confirmButton) return;

    this.footer.hidden = !config.showFooter;
    this.confirmButton.textContent = config.confirmText;

    if (config.confirmAction) {
      this.confirmButton.dataset.mobilePortalConfirmAction = config.confirmAction;
    } else {
      delete this.confirmButton.dataset.mobilePortalConfirmAction;
    }
  }

  private resetFooter(): void {
    if (!this.footer || !this.confirmButton) return;

    this.footer.hidden = false;
    this.confirmButton.textContent = DEFAULT_CONFIRM_TEXT;
    delete this.confirmButton.dataset.mobilePortalConfirmAction;
  }

  private startDrag(event: PointerEvent): void {
    if (!this.portal || !this.sheet || !this.activeState) return;
    if (!this.isEnabled()) return;

    this.dragPointerId = event.pointerId;
    this.dragStartY = event.clientY;
    this.dragOffsetY = 0;
    this.isDragging = true;
    this.sheet.style.transition = "none";
    this.backdrop && (this.backdrop.style.transition = "none");
    this.handle?.setPointerCapture?.(event.pointerId);
  }

  private onDragMove(event: PointerEvent): void {
    if (!this.isDragging || this.dragPointerId !== event.pointerId || !this.sheet) return;

    const offset = Math.max(0, event.clientY - this.dragStartY);
    this.dragOffsetY = offset;
    this.applyDragStyles(offset);
  }

  private endDrag(event: PointerEvent): void {
    if (!this.isDragging || this.dragPointerId !== event.pointerId) return;

    const shouldClose = this.dragOffsetY > 110;

    this.isDragging = false;
    this.dragPointerId = null;
    this.handle?.releasePointerCapture?.(event.pointerId);

    if (shouldClose) {
      this.resetDragStyles();
      this.close();
      return;
    }

    this.animateDragBack();
  }

  private applyDragStyles(offset: number): void {
    if (!this.sheet) return;

    const clampedOpacity = Math.max(0, 1 - offset / 220);
    this.sheet.style.transform = `translateY(${offset}px) scale(1)`;

    if (this.backdrop) {
      this.backdrop.style.opacity = String(clampedOpacity);
    }
  }

  private animateDragBack(): void {
    if (!this.sheet) return;

    this.sheet.style.transition =
      "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1)";

    if (this.backdrop) {
      this.backdrop.style.transition = "opacity 0.2s linear";
      this.backdrop.style.opacity = "";
    }

    this.sheet.style.transform = "";
    this.dragOffsetY = 0;
  }

  private resetDragStyles(): void {
    this.isDragging = false;
    this.dragPointerId = null;
    this.dragOffsetY = 0;

    if (this.sheet) {
      this.sheet.style.transition = "";
      this.sheet.style.transform = "";
    }

    if (this.backdrop) {
      this.backdrop.style.transition = "";
      this.backdrop.style.opacity = "";
    }
  }

  private getOptions(select: HTMLSelectElement): MobileSelectOption[] {
    return Array.from(select.options).map((option) => ({
      value: option.value,
      label: option.textContent?.trim() || "",
      disabled: option.disabled,
      selected: option.selected,
    }));
  }

  private getSelectLabel(select: HTMLSelectElement): string {
    const describedLabel =
      select.dataset.mobileSelectTitle ||
      select.dataset.mobilePortalTitle ||
      select.getAttribute("aria-label") ||
      select.closest<HTMLElement>(".InputWrap")
        ?.querySelector<HTMLElement>(".InputPlaceholder-label")
        ?.textContent
        ?.trim();

    return describedLabel || "Wybierz opcje";
  }

  private showNestedSelect(): void {
    if (!this.portal || !this.nested) return;

    this.nested.hidden = false;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        this.portal?.classList.add("--nested-visible");
        this.nested?.classList.add("--visible");
      });
    });
  }

  private hideNestedSelect(): boolean {
    if (!this.nested || this.nested.hidden) return false;

    this.nested.classList.remove("--visible");
    this.portal?.classList.remove("--nested-visible");
    window.setTimeout(() => {
      if (!this.nested || !this.nestedBody) return;
      this.nested.hidden = true;
      this.nestedBody.innerHTML = "";
      this.nestedState = null;
    }, 260);

    this.closeButton?.focus();
    return true;
  }

  private renderNestedSelectOptions(): void {
    if (!this.nestedBody || !this.nestedState) return;

    this.nestedBody.innerHTML = "";

    const optionsList = document.createElement("div");
    optionsList.className = "mobile-portal__options";
    optionsList.setAttribute("role", "listbox");

    this.nestedState.options.forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "mobile-portal__option";
      optionButton.textContent = option.label;
      optionButton.dataset.value = option.value;
      optionButton.setAttribute("role", "option");
      optionButton.setAttribute("aria-selected", String(this.nestedState?.draftValue === option.value));

      if (this.nestedState?.draftValue === option.value) {
        optionButton.classList.add("--selected");
      }

      if (option.disabled) {
        optionButton.disabled = true;
      }

      optionButton.addEventListener("click", () => {
        if (!this.nestedState || option.disabled) return;
        this.nestedState.draftValue = option.value;
        this.renderNestedSelectOptions();
      });

      optionsList.appendChild(optionButton);
    });

    this.nestedBody.appendChild(optionsList);
  }
}

export const mobilePortal = new MobilePortal();
