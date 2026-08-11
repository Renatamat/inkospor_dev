export const initHeader = (): void => {
  const header = document.querySelector<HTMLElement>('header') ?? document;
  const primaryHeader = document.querySelector<HTMLElement>('.primaryHeader');
  const mobileMenu = header.querySelector<HTMLElement>('.headerMenu');
  const hamburger = header.querySelector<HTMLElement>('.headerMainHamburger .c-btn');
  const closeMobileMenu = header.querySelector<HTMLElement>('#closeMobileMenu');

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
