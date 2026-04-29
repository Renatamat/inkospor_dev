# Mobile Portal API

## 1. Natywny select na mobile

Zwykly HTML-owy `select` na mobile otwiera portal automatycznie.

Przykladowe atrybuty:

- `data-mobile-select-title="Tytul portalu"`
- `data-mobile-portal-title="Tytul portalu"` jako fallback
- `data-mobile-portal-full-height`

Przyklad:

```html
<div class="InputWrap">
  <span class="InputPlaceholder-label">Kategorie</span>
  <select
    name="category"
    data-mobile-select-title="Kategorie"
  >
    <option value="">Wybierz kategorie</option>
    <option value="a">Opcja A</option>
    <option value="b">Opcja B</option>
  </select>
</div>
```

## 2. Trigger content-portalu

Przycisk otwiera tresc z kontenera wskazanego przez `data-mobile-portal-content-id`.

Wspierane atrybuty:

- `data-mobile-portal-trigger`
- `data-mobile-portal-title="Tytul portalu"`
- `data-mobile-portal-content-id="id-kontenera-z-trescia"`
- `data-mobile-portal-full-height`

Przyklad:

```html
<button
  type="button"
  data-mobile-portal-trigger
  data-mobile-portal-title="Informacja o dostawie"
  data-mobile-portal-content-id="mobile-portal-info-1"
>
  Otworz portal
</button>

<div id="mobile-portal-info-1" class="d-none" data-mobile-portal-source>
  <div>
    Dowolna tresc HTML do pokazania w body portalu.
  </div>
</div>
```

## 3. Content-portal z footerem i confirm

Jesli trigger ma `data-mobile-portal-confirm-action`, portal pokazuje footer z:

- `Anuluj`
- przyciskiem confirm

Wspierane atrybuty:

- `data-mobile-portal-confirm-action="nazwa-akcji"`
- `data-mobile-portal-confirm-text="Tekst przycisku confirm"`

Jesli `data-mobile-portal-confirm-text` nie jest ustawione, domyslnie bedzie `Wybierz`.

Przyklad:

```html
<button
  type="button"
  data-mobile-portal-trigger
  data-mobile-portal-title="Szczegoly promocji"
  data-mobile-portal-content-id="mobile-portal-promo-1"
  data-mobile-portal-confirm-action="promo-save"
  data-mobile-portal-confirm-text="Zastosuj"
>
  Otworz mobile portal
</button>
```

## 4. Event confirm

Po kliknieciu confirm w content-portalu emitowany jest event:

- `mobileportal:confirm`

W `detail` dostepne sa:

- `action`
- `contentId`
- `trigger`

Przyklad:

```html
<script>
  document.addEventListener("mobileportal:confirm", function(event) {
    const detail = event.detail || {};

    if (detail.action === "promo-save") {
      // twoja logika
    }
  });
</script>
```

## 5. Source content

Ukryty kontener z trescia warto oznaczyc:

- `data-mobile-portal-source`

Przyklad:

```html
<div id="mobile-portal-info-1" class="d-none" data-mobile-portal-source>
  <div>...</div>
</div>
```

To pozwala poprawnie:

- pominac wczesna inicjalizacje komponentow w ukrytym source
- zainicjalizowac formularze, galerie i swipery dopiero po skopiowaniu do portalu

## 6. Nested

`Nested` otwiera sie automatycznie tylko dla `selecta` kliknietego wewnatrz juz otwartego content-portalu.

Czyli:

- `select` poza portalem otwiera glowny portal
- `select` w content-portalu otwiera nested nad rodzicem

Nested:

- nie wymaga dodatkowych atrybutow
- nie zamyka rodzica
- po `Wybierz` ustawia wartosc prawdziwego `selecta`
- odpala natywny event `change`

## 7. Full Height

Pelna wysokosc dziala zarowno dla `select`, jak i dla triggera content-portalu.

Przyklad:

```html
<button
  type="button"
  data-mobile-portal-trigger
  data-mobile-portal-title="Pelny ekran"
  data-mobile-portal-content-id="mobile-portal-info-2"
  data-mobile-portal-full-height
>
  Otworz
</button>
```

## 8. Szybka sciaga atrybutow

### Dla select

- `data-mobile-select-title`
- `data-mobile-portal-title`
- `data-mobile-portal-full-height`

### Dla content triggera

- `data-mobile-portal-trigger`
- `data-mobile-portal-title`
- `data-mobile-portal-content-id`
- `data-mobile-portal-full-height`
- `data-mobile-portal-confirm-action`
- `data-mobile-portal-confirm-text`
