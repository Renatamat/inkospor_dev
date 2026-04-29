<?php
$stylePath = __DIR__ . '/public/css/style.css';
$bundlePath = __DIR__ . '/public/js/bundle/bundle.js';
$gsapBundlePath = __DIR__ . '/public/js/bundle/gsap.bundle.js';

$styleVersion = file_exists($stylePath) ? filemtime($stylePath) : time();
$bundleVersion = file_exists($bundlePath) ? filemtime($bundlePath) : time();
$gsapBundleVersion = file_exists($gsapBundlePath) ? filemtime($gsapBundlePath) : time();
?>
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mobile Portal Test</title>

    <link rel="stylesheet" href="public/css/style.css?v=<?php echo $styleVersion; ?>" />
  </head>
  <body>
    <main style="padding: 24px; max-width: 960px; margin: 0 auto;">
      <h1 style="margin-bottom: 32px;">Mobile portal test</h1>

      <div class="InputWrap">
        <span class="InputPlaceholder-label p-xs mb-8 d-block">Sortuj loty</span>
        <select
          name="flight_sort"
          placeholder="Wybierz sposob sortowania"
          data-mobile-select-title="Sortuj loty"
        >
          <option value="">Wybierz sposob sortowania</option>
          <option value="arrival">Arrival Time</option>
          <option value="departure">Departure Time</option>
          <option value="price">Lowest Fare</option>
          <option value="duration">Duration</option>
          <option value="nonstop">Non-Stop</option>
        </select>
      </div>

      <div style="margin-top: 40px;">
        <div
          id="promo-status"
          style="margin-bottom: 16px; padding: 12px 16px; border-radius: 12px; background: #eef1f8;"
        >
          Promocja nie zostala jeszcze aktywowana.
        </div>

        <button
          type="button"
          class="c-btn c-btn--primary"
          data-mobile-portal-trigger
          data-mobile-portal-title="Szczegoly promocji"
          data-mobile-portal-content-id="mobile-portal-promo-1"
          data-mobile-portal-confirm-action="promo-save"
          data-mobile-portal-confirm-text="Zastosuj"
        >
          Otworz mobile portal
        </button>
      </div>

      <div style="margin-top: 16px;">
        <button
          type="button"
          class="c-btn c-btn--primary"
          data-mobile-portal-trigger
          data-mobile-portal-title="Informacja o dostawie"
          data-mobile-portal-content-id="mobile-portal-info-1"
          data-mobile-portal-full-height
        >
          Otworz portal informacyjny
        </button>
      </div>

      <div style="margin-top: 16px;">
        <button
          type="button"
          class="c-btn c-btn--primary"
          data-mobile-portal-trigger
          data-mobile-portal-title="Formularz"
          data-mobile-portal-content-id="mobile-portal-info-2"
        >
          Otworz formularz
        </button>
      </div>

      <div style="margin-top: 32px;">
        <h2 style="margin-bottom: 16px;">LightGallery poza portalem</h2>
        <div
          class="gallery-zoom d-flex flex-wrap r-gap-24 r-gap-xxxl-48"
          data-id="gallery-zoom-outside"
          data-lightgallery-config='{"selector": ".gallery-item", "animateThumb": false, "download": true}'
        >
          <div class="row r-gap-24 r-gap-xxxl-48 row-lg-c-3">
            <div class="col-lg-6">
              <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
              </a>
            </div>
            <div class="col-lg-6">
              <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
              </a>
            </div>
            <div class="col-lg-12">
              <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="mobile-portal-promo-1" class="d-none" data-mobile-portal-source>
        <div style="padding: 8px 4px 24px;">
          <p style="margin-bottom: 16px;">
            Odbierz zamowienie w siedzibie Healion, bez kosztow dostawy.
            Zamow online i odbierz wygodnie, bez czekania na kuriera.
          </p>
          <p style="margin-bottom: 16px;">
            Jesli zamowienie nie zostalo oplacone w sklepie internetowym,
            platnosc przy odbiorze mozliwa jest wylacznie gotowka.
          </p>
          <a href="#" class="c-btn c-btn--primary">Przejdz dalej</a>
        </div>
      </div>

      <div id="mobile-portal-info-1" class="d-none" data-mobile-portal-source>
        <div style="padding: 8px 4px 24px;">
          <div
            class="gallery-zoom d-flex flex-wrap r-gap-24 r-gap-xxxl-48"
            data-id="gallery-zoom-inside"
            data-lightgallery-config='{"selector": ".gallery-item", "animateThumb": false, "download": true}'
          >
            <div class="row r-gap-24 r-gap-xxxl-48 row-lg-c-3">
              <div class="col-lg-6">
                <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                  <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
                </a>
              </div>
              <div class="col-lg-6">
                <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                  <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
                </a>
              </div>
              <div class="col-lg-12">
                <a href="#galleryModal" data-src="/emptypro/source/images/foto_frame.jpg" class="gallery-item">
                  <img src="/emptypro/source/images/foto_frame.jpg" class="img-fluid img-thumbnail" alt="" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="mobile-portal-info-2" class="d-none" data-mobile-portal-source>
        <div style="padding: 8px 4px 24px;">
          <div class="row mb-32 r-gap-32">
            <div class="col-12 col-lg-6">
              <div class="d-flex flex-column gap-24">
                <span class="p-m fw-bolder text-uppercase">Tagline</span>
                <h2 class="h5 fw-bolder">Shorter headers are punchy</h2>
                <div class="col-12">
                  <p class="p-m">
                    The body text should clarify your main intention.
                    <br />
                    Why should people care about your product?
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-6">
              <div class="d-flex gap-24 flex-wrap flex-column">
                <div class="InputWrap InputWrap">
                  <span class="InputPlaceholder-label p-xs mb-8 d-block">Label</span>
                  <span class="InputPlaceholder">Input Text</span>
                  <div class="wpcf7">
                    <div class="wpcf7-wrapper">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.16553C10.3341 2.16553 8.73645 2.8273 7.55849 4.00526C6.38052 5.18323 5.71875 6.78089 5.71875 8.44678C5.71875 9.12692 5.99326 10.1556 6.49495 11.4236C6.98717 12.6678 7.66387 14.0599 8.39429 15.4353C9.7137 17.9196 11.1854 20.3061 12 21.592C12.8146 20.3057 14.2863 17.9191 15.6057 15.4349C16.3361 14.0596 17.0128 12.6676 17.5051 11.4235C18.0067 10.1555 18.2812 9.12691 18.2812 8.44678C18.2812 6.78089 17.6195 5.18323 16.4415 4.00526C15.2636 2.8273 13.6659 2.16553 12 2.16553Z" fill="#63616E"></path>
                      </svg>
                      <input type="text" />
                    </div>
                  </div>
                </div>

                <div class="InputWrap">
                  <div>
                    <span class="InputPlaceholder-label p-xs mb-8 d-block">Kategorie</span>
                    <select class="c-select" placeholder="Wybierz kategorie">
                      <option value="option-1">Wybierz kategorie</option>
                      <option value="option-2">Wybierz kategorie 2</option>
                      <option value="option-3">Wybierz kategorie 3</option>
                    </select>
                  </div>
                </div>

                <div class="InputWrap InputWrap--textarea">
                  <p>
                    <span class="InputPlaceholder">Input Text</span>
                  </p>
                  <span class="wpcf7">
                    <div class="wpcf7-wrapper">
                      <textarea rows="3"></textarea>
                    </div>
                  </span>
                </div>

                <a href="#" class="c-btn c-btn-fill c-btn-mobile c-btn-m">
                  <span>Primary Button</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <script src="public/js/bundle/bundle.js?v=<?php echo $bundleVersion; ?>"></script>
    <script src="public/js/bundle/gsap.bundle.js?v=<?php echo $gsapBundleVersion; ?>"></script>
    <script>
      document.addEventListener("mobileportal:confirm", function(event) {
        const detail = event.detail || {};

        if (detail.action === "promo-save") {
          const status = document.getElementById("promo-status");

          if (status) {
            status.textContent = "Promocja zostala aktywowana i zapisana.";
            status.style.background = "#e7f7ea";
            status.style.color = "#0f6b2a";
            status.style.border = "1px solid #8ed19b";
          }

          if (detail.trigger instanceof HTMLElement) {
            detail.trigger.textContent = "Promocja aktywna";
            detail.trigger.setAttribute("disabled", "true");
            detail.trigger.style.opacity = "0.7";
            detail.trigger.style.pointerEvents = "none";
          }
        }
      });
    </script>
  </body>
</html>
