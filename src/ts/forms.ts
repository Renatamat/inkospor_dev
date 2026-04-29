// ============================================
// FORM HANDLERS - Dostosowane do istniejących stylów SCSS
// ============================================

import { mobilePortal } from "./mobile-portal";  
 
type InputElement = HTMLInputElement | HTMLTextAreaElement;
let isOutsideClickHandlerBound = false;
let isPortalContentListenerBound = false;

/**
 * Znajduje najbliższy element InputWrap
 */
const findInputWrap = (element: HTMLElement): HTMLElement | null => {
  let wrap = element.closest<HTMLElement>('.InputWrap');
  if (wrap) return wrap;
  
  let parent = element.parentElement;
  while (parent) {
    if (parent.classList.contains('InputWrap')) {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  return null;
};

/**
 * Walidacja email
 */
const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * Walidacja telefonu
 */
const isValidPhone = (phone: string): boolean => {
  const pattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

/**
 * Aktualizuje stan InputWrap
 */
const updateInputWrapState = (
  inputWrap: HTMLElement,
  state: 'focus' | 'active' | 'error',
  add: boolean
): void => {
  const className = `--${state}`;
  
  if (add) {
    inputWrap.classList.add(className);
  } else {
    inputWrap.classList.remove(className);
  }
  
  // Aktualizuj placeholder przy focus
  if (state === 'focus') {
    const placeholder = inputWrap.querySelector<HTMLElement>('.InputPlaceholder');
    if (placeholder) {
      if (add) {
        placeholder.classList.add('--focus');
      } else {
        placeholder.classList.remove('--focus');
      }
    }
  }
};

/**
 * Waliduje input
 */
const validateInput = (input: HTMLInputElement, inputWrap: HTMLElement): boolean => {
  const value = input.value.trim();
  const type = input.type;
  const required = input.hasAttribute('required');
  const minLength = parseInt(input.getAttribute('minlength') || '0', 10);
  
  // Pole puste
  if (value === '') {
    if (required) {
      updateInputWrapState(inputWrap, 'error', true);
      updateInputWrapState(inputWrap, 'active', false);
      return false;
    }
    // Pole opcjonalne i puste
    updateInputWrapState(inputWrap, 'error', false);
    updateInputWrapState(inputWrap, 'active', false);
    return true;
  }
  
  // Minimalna długość
  if (minLength > 0 && value.length < minLength) {
    updateInputWrapState(inputWrap, 'error', true);
    updateInputWrapState(inputWrap, 'active', false);
    return false;
  }
  
  // Walidacja typu
  let isValid = true;
  
  switch (type) {
    case 'email':
      isValid = isValidEmail(value);
      break;
    case 'tel':
      isValid = isValidPhone(value);
      break;
    case 'url':
      try {
        new URL(value);
        isValid = true;
      } catch {
        isValid = false;
      }
      break;
    default:
      isValid = true;
  }
  
  if (isValid) {
    updateInputWrapState(inputWrap, 'error', false);
    updateInputWrapState(inputWrap, 'active', true);
  } else {
    updateInputWrapState(inputWrap, 'error', true);
    updateInputWrapState(inputWrap, 'active', false);
  }
  
  return isValid;
};

/**
 * Waliduje textarea
 */
const validateTextarea = (textarea: HTMLTextAreaElement, inputWrap: HTMLElement): boolean => {
  const value = textarea.value.trim();
  const required = textarea.hasAttribute('required');
  const minLength = parseInt(textarea.getAttribute('minlength') || '0', 10);
  
  if (value === '') {
    if (required) {
      updateInputWrapState(inputWrap, 'error', true);
      updateInputWrapState(inputWrap, 'active', false);
      return false;
    }
    updateInputWrapState(inputWrap, 'error', false);
    updateInputWrapState(inputWrap, 'active', false);
    return true;
  }
  
  if (minLength > 0 && value.length < minLength) {
    updateInputWrapState(inputWrap, 'error', true);
    updateInputWrapState(inputWrap, 'active', false);
    return false;
  }
  
  updateInputWrapState(inputWrap, 'error', false);
  updateInputWrapState(inputWrap, 'active', true);
  return true;
};

/**
 * Inicjalizuje inputy
 */
const initInputHandlers = (root: ParentNode = document): void => {
  const inputs = root.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[type="url"], input[type="number"]'
  );
  
  inputs.forEach((input) => {
    if (input.closest('[data-mobile-portal-source]')) return;
    if (input.dataset.formInitialized === 'true') return;

    const inputWrap = findInputWrap(input);
    if (!inputWrap) return;
    
    // Focus
    input.addEventListener('focus', () => {
      updateInputWrapState(inputWrap, 'focus', true);
    });
    
    // Blur
    input.addEventListener('blur', () => {
      // Usuń focus tylko jeśli pole puste
      if (input.value.trim() === '') {
        updateInputWrapState(inputWrap, 'focus', false);
      }
      validateInput(input, inputWrap);
    });
    
    // Input - live validation (usuwa error podczas pisania)
    input.addEventListener('input', () => {
      if (inputWrap.classList.contains('--error')) {
        validateInput(input, inputWrap);
      }
    });
    
    // Stan początkowy (autofill)
    if (input.value.trim() !== '') {
      validateInput(input, inputWrap);
      updateInputWrapState(inputWrap, 'focus', true);
    }

    input.dataset.formInitialized = 'true';
  });
};

/**
 * Inicjalizuje textareas
 */
const initTextareaHandlers = (root: ParentNode = document): void => {
  const textareas = root.querySelectorAll<HTMLTextAreaElement>('textarea');
  
  textareas.forEach((textarea) => {
    if (textarea.closest('[data-mobile-portal-source]')) return;
    if (textarea.dataset.formInitialized === 'true') return;

    const inputWrap = findInputWrap(textarea);
    if (!inputWrap) return;
    
    textarea.addEventListener('focus', () => {
      updateInputWrapState(inputWrap, 'focus', true);
    });
  
    textarea.addEventListener('blur', () => {
      if (textarea.value.trim() === '') {
        updateInputWrapState(inputWrap, 'focus', false);
      }
      validateTextarea(textarea, inputWrap);
    });
    
    textarea.addEventListener('input', () => {
      if (inputWrap.classList.contains('--error')) {
        validateTextarea(textarea, inputWrap);
      }
    });
    
    if (textarea.value.trim() !== '') {
      validateTextarea(textarea, inputWrap);
      updateInputWrapState(inputWrap, 'focus', true);
    }

    textarea.dataset.formInitialized = 'true';
  });
};

/**
 * Inicjalizuje custom selects
 */
const syncCustomSelectState = (
  select: HTMLSelectElement,
  replacementDiv: HTMLElement,
  span: HTMLElement,
): void => {
  const selectedOption = select.options[select.selectedIndex];
  const placeholder = select.getAttribute('placeholder') || select.getAttribute('data-placeholder') || '';

  span.textContent = selectedOption?.textContent || placeholder;

  replacementDiv
    .querySelectorAll<HTMLElement>('.select-option')
    .forEach((optionElement, index) => {
      optionElement.classList.toggle('--active', index === select.selectedIndex);
    });

  if (select.value !== '') {
    replacementDiv.classList.add('--active');
  } else {
    replacementDiv.classList.remove('--active');
  }
};

const initCustomSelects = (root: ParentNode = document): void => {
  const selects = root.querySelectorAll<HTMLSelectElement>('select');
  
  selects.forEach((select) => {
    if (select.closest('[data-mobile-portal-source]')) return;
    if (select.dataset.customSelectInitialized === 'true') return;

    // Sprawdź czy już zastąpiony
    if (select.style.display === 'none' && select.previousElementSibling?.classList.contains('custom-select')) {
      select.dataset.customSelectInitialized = 'true';
      return;
    }
    
    const replacementDiv = document.createElement('div');
    replacementDiv.className = 'custom-select';
    
    const selectedDiv = document.createElement('div');
    selectedDiv.className = 'select-selected';
    
    const span = document.createElement('span');
    const placeholder = select.getAttribute('placeholder') || select.getAttribute('data-placeholder');
    span.textContent = placeholder || select.options[select.selectedIndex]?.textContent || '';
    selectedDiv.appendChild(span);
    
    if (select.selectedIndex > 0) {
      replacementDiv.classList.add('--active');
    }
    
    replacementDiv.appendChild(selectedDiv);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'select-options-container';
    
    Array.from(select.options).forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.textContent = option.textContent || '';
      optionDiv.dataset.value = option.value;
      optionDiv.className = 'select-option';
      
      if (select.selectedIndex === index) {
        optionDiv.classList.add('--active');
      }
      
      optionDiv.addEventListener('click', () => {
        if (mobilePortal.isEnabled()) {
          return;
        }

        optionsContainer.querySelectorAll('.select-option').forEach((opt) => {
          opt.classList.remove('--active');
        });
        
        optionDiv.classList.add('--active');
        select.value = optionDiv.dataset.value || '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        span.textContent = optionDiv.textContent;
        
        if (select.selectedIndex > 0) {
          replacementDiv.classList.add('--active');
        } else {
          replacementDiv.classList.remove('--active');
        }
        
        replacementDiv.classList.remove('--show');
        optionsContainer.classList.remove('--show');
      });
      
      optionsContainer.appendChild(optionDiv);
    });
    
    replacementDiv.appendChild(optionsContainer);
    
    selectedDiv.addEventListener('click', (event) => {
      event.stopPropagation();

      if (mobilePortal.isEnabled()) {
        mobilePortal.openSelect(select, selectedDiv);
        return;
      }
      
      // Zamknij inne selecty
      document.querySelectorAll('.custom-select.--show').forEach((openSelect) => {
        if (openSelect !== replacementDiv) {
          openSelect.classList.remove('--show');
          openSelect.querySelector('.select-options-container')?.classList.remove('--show');
        }
      });
      
      replacementDiv.classList.toggle('--show');
      optionsContainer.classList.toggle('--show');
    });
    
    select.parentNode?.insertBefore(replacementDiv, select);
    select.style.display = 'none';
    select.addEventListener('change', () => {
      syncCustomSelectState(select, replacementDiv, span);
    });
    syncCustomSelectState(select, replacementDiv, span);
    select.dataset.customSelectInitialized = 'true';
  });
};

/**
 * Zamyka selecty po kliknięciu poza
 */
const initOutsideClickHandler = (): void => {
  if (isOutsideClickHandlerBound) return;
  isOutsideClickHandlerBound = true;

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Node;
    
    document.querySelectorAll<HTMLElement>('.select-options-container.--show').forEach((container) => {
      const customSelect = container.parentElement;
      
      if (customSelect && !customSelect.contains(target)) {
        container.classList.remove('--show');
        customSelect.classList.remove('--show');
      }
    });
  });
};

/**
 * Waliduje cały formularz
 */
export const validateForm = (form: HTMLFormElement): boolean => {
  let isValid = true;
  
  form.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[type="url"]'
  ).forEach((input) => {
    const inputWrap = findInputWrap(input);
    if (inputWrap && !validateInput(input, inputWrap)) {
      isValid = false;
    }
  });
  
  form.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
    const inputWrap = findInputWrap(textarea);
    if (inputWrap && !validateTextarea(textarea, inputWrap)) {
      isValid = false;
    }
  });
  
  return isValid;
};

/**
 * Główna funkcja init
 */
const initPortalContentListener = (): void => {
  if (isPortalContentListenerBound) return;
  isPortalContentListenerBound = true;

  document.addEventListener('mobileportal:content-ready', (event: Event) => {
    const customEvent = event as CustomEvent<{ root?: ParentNode }>;
    const root = customEvent.detail?.root;
    if (!root) return;

    initFormHandlers(root);
  });
};

export const initFormHandlers = (root: ParentNode = document): void => {
  initInputHandlers(root);
  initTextareaHandlers(root);
  initCustomSelects(root);
  initOutsideClickHandler();
  initPortalContentListener();
  
  // Walidacja przy submicie
  root.querySelectorAll<HTMLFormElement>('form').forEach((form) => {
    if (form.closest('[data-mobile-portal-source]')) return;
    if (form.dataset.formSubmitInitialized === 'true') return;

    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        
        // Scroll do pierwszego błędu
        const firstError = form.querySelector('.InputWrap.--error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    form.dataset.formSubmitInitialized = 'true';
  });
};
