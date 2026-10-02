/* =========================================================
   1. КАСТОМНЫЙ КУРСОР
   ========================================================= */
const cursor = document.getElementById("cursor");
let mouseX = 0,
  mouseY = 0;
let cursorX = 0,
  cursorY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  // Плавное следование
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Увеличение курсора при наведении на текст (кроме имени и project-link)
const textElements = document.querySelectorAll(
  ".nav-link, .side-list span, .side-list a, .big-heading, .project-name, .project-date, .project-type",
);

textElements.forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

// Увеличение курсора при наведении на project-link
document.querySelectorAll(".project-link").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

/* =========================================================
   2. ЭФФЕКТ SCRAMBLE (замена букв на рандомные символы)
   ========================================================= */
const CHARS = "!<>-_\\/[]{}—=+*^?#________";

class Scramble {
  constructor(el) {
    this.el = el;
    this.original = el.textContent;
    this.interval = null;
  }

  scramble() {
    const original = this.original;
    let frame = 0;
    const totalFrames = 20;

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      frame++;
      let output = "";
      for (let i = 0; i < original.length; i++) {
        if (original[i] === " ") {
          output += " ";
          continue;
        }
        // Постепенно "застывают" буквы
        if (frame > totalFrames * (i / original.length)) {
          output += original[i];
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      this.el.textContent = output;

      if (frame >= totalFrames) {
        clearInterval(this.interval);
        this.el.textContent = original;
      }
    }, 40);
  }
}

// Навешиваем scramble на все элементы с data-scramble
const scrambleEls = document.querySelectorAll("[data-scramble]");
const scramblers = new Map();

scrambleEls.forEach((el) => {
  // Для project-link нужно скрамблить только текст, не иконки — оборачиваем
  const scrambler = new Scramble(el);
  scramblers.set(el, scrambler);

  el.addEventListener("mouseenter", () => scrambler.scramble());
});

// Для project-link (там внутри спаны) — сканим каждый спан отдельно
document.querySelectorAll(".project-link").forEach((link) => {
  const spans = link.querySelectorAll("span");
  spans.forEach((span) => {
    const scrambler = new Scramble(span);
    link.addEventListener("mouseenter", () => scrambler.scramble());
  });
});

/* =========================================================
   4. HOVER IMAGE — всплывающая картинка при наведении на ссылку
   ========================================================= */
const hoverImage = document.getElementById("hoverImage");
const hoverInner = hoverImage.querySelector(".hover-image-inner");

document.querySelectorAll(".project-link").forEach((link) => {
  link.addEventListener("mouseenter", () => {
    hoverImage.classList.add("visible");
    // Здесь потом можно подставлять реальную картинку:
    // const src = link.dataset.image;
    // hoverInner.style.backgroundImage = `url(${src})`;
  });

  link.addEventListener("mouseleave", () => {
    hoverImage.classList.remove("visible");
  });
});

// Плавное следование картинки за курсором
let imgX = 0,
  imgY = 0;
let targetImgX = 0,
  targetImgY = 0;

document.addEventListener("mousemove", (e) => {
  targetImgX = e.clientX;
  targetImgY = e.clientY;
});

function animateHoverImage() {
  imgX += (targetImgX - imgX) * 0.15;
  imgY += (targetImgY - imgY) * 0.15;
  hoverImage.style.transform = `translate(${imgX}px, ${imgY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateHoverImage);
}
animateHoverImage();

/* =========================================================
   5. HERO TITLE — единый масштаб по ширине + вертикальное раскрытие
   ========================================================= */
const heroTitle = document.querySelector(".hero-title");
const titleParts = document.querySelectorAll(".title-part");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Насколько каждое слово уходит вниз при скролле, px. Оба слова движутся
// только вниз, но с разной скоростью, поэтому они расходятся.
// Первый элемент — KSENIA, второй — MOSKALENKO.
const SPREAD_PX = [200, 200];
// Насколько буквы вытягиваются по вертикали к концу скролла.
const STRETCH_Y = 0.5;

let fitScaleX = 1;
let spreadProgress = 0;

// Ширина текста без учёта transform самого элемента. Замеряем на скрытом
// клоне с той же типографикой: ширина .title-part иначе обрезается
// правой границей контейнера и scaleX вышел бы равным 1.
let measureEl = null;

function measureNaturalWidth(part) {
  if (!measureEl) {
    measureEl = document.createElement("span");
    measureEl.style.cssText =
      "position:absolute;left:-99999px;top:0;white-space:nowrap;" +
      "visibility:hidden;pointer-events:none;";
    document.body.appendChild(measureEl);
  }

  const cs = getComputedStyle(part);
  [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "fontStretch",
    "fontVariationSettings",
    "fontFeatureSettings",
    "fontOpticalSizing",
    "letterSpacing",
    "wordSpacing",
    "textTransform",
  ].forEach((prop) => {
    measureEl.style[prop] = cs[prop];
  });

  measureEl.textContent = part.textContent;
  return measureEl.getBoundingClientRect().width;
}

// Оба слова сжимаются ОДИНАКОВЫМ коэффициентом: берём масштаб от суммы их
// натуральных ширин, чтобы KSENIA и MOSKALENKO выглядели одинаково
// и при этом ровно заполняли ширину экрана.
function fitTitle() {
  if (!heroTitle || titleParts.length === 0) return;

  const contentWidth = heroTitle.clientWidth - 20; // 10px padding с каждой стороны
  if (contentWidth <= 0) return;

  let totalNatural = 0;
  const widths = [];

  titleParts.forEach((part) => {
    const natural = measureNaturalWidth(part);
    widths.push(natural);
    totalNatural += natural;
  });

  if (totalNatural <= 0) return;

  const scale = contentWidth / totalNatural;
  if (!Number.isFinite(scale) || scale <= 0) return;

  fitScaleX = scale;
  renderTitle();
}

// Единственное место, где пишется transform: подгонка по ширине (scaleX)
// и вертикальное раскрытие (translateY + scaleY) собираются вместе,
// чтобы не затирать друг друга.
function renderTitle() {
  titleParts.forEach((part, i) => {
    const dy = reduceMotion ? 0 : spreadProgress * SPREAD_PX[i];
    const sy = reduceMotion ? 1 : 1 + spreadProgress * STRETCH_Y;

    part.style.transform = `translateY(${dy}px) scaleX(${fitScaleX}) scaleY(${sy})`;
  });
}

// Прокручивая секцию hero мимо, слова расходятся по вертикали и вытягиваются
// вниз. Горизонтальный масштаб не трогаем — текст не уходит за края экрана
// и не расползается в стороны.
function updateHeroTitle() {
  if (!heroTitle) return;

  const hero = heroTitle.closest(".hero");
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const total = hero.offsetHeight || window.innerHeight;

  spreadProgress = Math.min(Math.max(-rect.top / total, 0), 1);
  renderTitle();
}

let titleTicking = false;

function onTitleScroll() {
  if (titleTicking) return;
  titleTicking = true;
  requestAnimationFrame(() => {
    updateHeroTitle();
    titleTicking = false;
  });
}

window.addEventListener("scroll", onTitleScroll, { passive: true });

window.addEventListener("resize", () => {
  fitTitle();
  updateHeroTitle();
});

// После загрузки шрифта метрики меняются — пересчитываем под реальные глифы
document.fonts.ready.then(fitTitle);
document.fonts.addEventListener("loadingdone", fitTitle);

fitTitle();
updateHeroTitle();
