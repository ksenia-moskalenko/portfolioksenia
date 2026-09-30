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
   3. STICKY SCROLL — переключение проектов
   ========================================================= */
const projectsSection = document.querySelector(".projects");
const projects = document.querySelectorAll(".project");
const totalProjects = projects.length;

function updateActiveProject() {
  const rect = projectsSection.getBoundingClientRect();
  const sectionHeight = projectsSection.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  const progress = Math.min(Math.max(scrolled / sectionHeight, 0), 1);

  const activeIndex = Math.min(
    Math.floor(progress * totalProjects),
    totalProjects - 1,
  );

  projects.forEach((p, i) => {
    p.classList.toggle("active", i === activeIndex);
  });
}

window.addEventListener("scroll", updateActiveProject);
window.addEventListener("resize", updateActiveProject);
updateActiveProject();

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
