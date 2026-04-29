export const initAccordion = (): void => {

    document.querySelectorAll<HTMLButtonElement>('.accordion-header.active').forEach(header => {
      const content = header.nextElementSibling as HTMLElement | null;
      if (content) {
        content.style.maxHeight = content.scrollHeight + 16 + 'px';
      }
    });

    // Obsługa kliknięcia na nagłówki accordion
    document.querySelectorAll<HTMLButtonElement>('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const activeHeader = document.querySelector<HTMLButtonElement>('.accordion-header.active');

        // Zamknij aktywny accordion, jeśli jest inny niż kliknięty
        if (activeHeader && activeHeader !== header) {
          activeHeader.classList.remove('active');
          const activeContent = activeHeader.nextElementSibling as HTMLElement | null;
          if (activeContent) {
            activeContent.style.maxHeight = '0px'; // Zamknij zawartość
          }
        }

        // Obsługa klikniętego nagłówka
        const content = header.nextElementSibling as HTMLElement | null;
        if (!content) return; // Guard clause
        
        header.classList.toggle('active');

        if (header.classList.contains('active')) {
          // Oblicz dynamiczną wysokość zawartości i dodaj 32px
          content.style.maxHeight = content.scrollHeight + 32 + 'px';
        } else {
          content.style.maxHeight = '0px'; // Zamknij zawartość
        }
      });
    });
};