export const initHeader = (): void => {
  const header = document.querySelector<HTMLElement>('header') ?? document;
  const primaryHeader = document.querySelector<HTMLElement>('.primaryHeader');
  const mobileMenu = header.querySelector<HTMLElement>('.headerMenu');
  const hamburger = header.querySelector<HTMLElement>('.headerMainHamburger .c-btn');
  const closeMobileMenu = header.querySelector<HTMLElement>('#closeMobileMenu');
  const headerMainWWW = header.querySelector<HTMLElement>('.headerMain.--www');

  if (headerMainWWW) {
    const scrollOffset = 70;
    let isScrollState = false;
    let isScrollTicking = false;

    const updateHeaderScrollState = (): void => {
      const shouldHaveScrollState = window.scrollY >= scrollOffset;

      if (shouldHaveScrollState !== isScrollState) {
        isScrollState = shouldHaveScrollState;
        headerMainWWW.classList.toggle('--scroll', shouldHaveScrollState);
      }
    };

    const requestHeaderScrollUpdate = (): void => {
      if (isScrollTicking) return;

      isScrollTicking = true;
      window.requestAnimationFrame(() => {
        updateHeaderScrollState();
        isScrollTicking = false;
      });
    };

    updateHeaderScrollState();
    window.addEventListener('scroll', requestHeaderScrollUpdate, { passive: true });
  }

  if (mobileMenu) {
    const syncPageScrollLock = (): void => {
      const isMenuOpen = mobileMenu.classList.contains('--showMobile');

      document.body.classList.toggle(
        '--mobile-menu-open',
        isMenuOpen,
      );

      if (!isMenuOpen) {
        mobileMenu.querySelectorAll<HTMLElement>('.wrapper-subnav.--active').forEach((submenu) => {
          submenu.classList.remove('--active');
        });
        mobileMenu.querySelectorAll<HTMLElement>('.menu-item.has-submenu > button').forEach((trigger) => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    };

    syncPageScrollLock();
    new MutationObserver(syncPageScrollLock).observe(mobileMenu, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  header.querySelectorAll<HTMLElement>('.headerMenu.--www .menu-item.has-submenu').forEach((item) => {
    const submenuTrigger = item.querySelector<HTMLButtonElement>(':scope > button');
    const submenuLink = submenuTrigger?.querySelector<HTMLAnchorElement>('a');
    const submenuWrapper = item.querySelector<HTMLElement>(':scope > .wrapper-subnav');
    const submenuBack = submenuWrapper?.querySelector<HTMLElement>('.submenu-back');
    const submenuName = submenuWrapper?.querySelector<HTMLElement>('.submenu-name');

    if (!submenuTrigger || !submenuWrapper) return;

    submenuTrigger.setAttribute('aria-expanded', 'false');

    submenuTrigger.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('a')) return;

      event.preventDefault();
      if (submenuLink && submenuName) {
        submenuName.textContent = submenuLink.textContent?.trim() ?? '';
      }
      submenuWrapper.classList.add('--active');
      submenuTrigger.setAttribute('aria-expanded', 'true');
    });

    submenuBack?.addEventListener('click', () => {
      submenuWrapper.classList.remove('--active');
      submenuTrigger.setAttribute('aria-expanded', 'false');
      submenuTrigger.focus();
    });
  });

  const infoItem = header.querySelector<HTMLLIElement>('.menu-item.has-submenu.info-item');
  const trigger = infoItem?.querySelector<HTMLAnchorElement>('.blog-accordeon');
  const wrapper = infoItem?.querySelector<HTMLElement>('.wrapper-subnav');
  const submenu = infoItem?.querySelector<HTMLElement>('.subnav');
  const iconDown = infoItem?.querySelector<HTMLElement>('.icon-minus');
  const iconUp = infoItem?.querySelector<HTMLElement>('.icon-plus');

  if (!infoItem || !trigger || !wrapper || !submenu) return;

  const setOpen = (isOpen: boolean): void => {
    infoItem.classList.toggle('--active', isOpen);
    wrapper.classList.toggle('d-none', !isOpen);
    submenu.classList.toggle('show', isOpen);
    trigger.setAttribute('aria-expanded', String(isOpen));

    iconDown?.classList.toggle('d-none', isOpen);
    iconUp?.classList.toggle('d-none', !isOpen);
  };

  const isOpen = (): boolean => trigger.getAttribute('aria-expanded') === 'true';

  setOpen(false);

  trigger.addEventListener('click', (event: MouseEvent) => {
    event.preventDefault();
    setOpen(!isOpen());
  });

  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (!target || !isOpen() || infoItem.contains(target)) return;

    setOpen(false);
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      trigger.focus();
    }
  });

  const closeMobile = (): void => {
    mobileMenu?.classList.remove('--showMobile');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    hamburger?.setAttribute('aria-expanded', 'false');
    primaryHeader?.classList.remove('--openMenu');
  };

  hamburger?.setAttribute('aria-controls', 'mobileMenu');
  hamburger?.setAttribute('aria-expanded', 'false');

  hamburger?.addEventListener('click', (event: MouseEvent) => {
    event.preventDefault();
    mobileMenu?.classList.add('--showMobile');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    hamburger?.setAttribute('aria-expanded', 'true');
    primaryHeader?.classList.add('--openMenu');
  });

  closeMobileMenu?.addEventListener('click', () => {
    closeMobile();
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && mobileMenu?.classList.contains('--showMobile')) {
      closeMobile();
      hamburger?.focus();
    }
  });
};
