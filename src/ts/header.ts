export const initHeader = (): void => {
  const header = document.querySelector<HTMLElement>('header');
  if (!header) return;

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
};
