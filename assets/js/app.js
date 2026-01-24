const $ = (s) => document.querySelector(s);

const SUPPORTED_LANGS = ["en", "es", "de"];
let currentLang = "en";

let introPlayed = false;
let experienceBound = false;
let smoothScrollBound = false;
let revealBound = false;

const I18N = {
  en: {
    pageTitle: "CV | Martin Milev",
    metaDescription: "Online CV of Martin Milev. Systems, advanced support, databases and technical documentation.",

    introKicker: "ONLINE RESUME",
    introTitle: "Loading CV…",
    introSub: "Technical profile focused on systems, advanced support and databases.",
    introLoadingBtn: "Loading…",
    introEntering: "Entering…",
    enterGithubText: "View GitHub",
    introFootBadge: "Public CV (no sensitive data)",

    navSkills: "Skills",
    navEducation: "Education",
    navExperience: "Experience",
    navProjects: "Projects",

    ctaMail: "Contact",
    ctaExperience: "Go to my experience",

    labelLocation: "Location",
    labelEmail: "Email",
    labelLinkedIn: "LinkedIn",
    labelPdf: "CV PDF",
    labelFocus: "Focus",

    viewProfile: "View profile",
    download: "Download",

    publicNote: "This CV is public and does not include sensitive data.",

    skillsTitle: "Skills",
    skillsSubtitle: "Technologies and tools I use in my day-to-day.",
    educationTitle: "Education",
    educationSubtitle: "Degrees and additional training.",
    experienceTitle: "Experience",
    experienceHint: "Click each role to see my responsibilities.",
    projectsTitle: "Projects",
    projectsSubtitle: "Repos and technical material that strengthen my profile.",
    projectsMore: "More on GitHub",

    expandAll: "Expand all",
    collapseAll: "Collapse all",

    projectDemo: "Demo",
    projectRepo: "Repo",

    cvPdfFallbackLabel: "Download CV (PDF)",
    alertLoadFail: "Could not load content. Please check your JSON files in /content."
  },

  es: {
    pageTitle: "CV | Martin Milev",
    metaDescription: "CV online de Martin Milev. Sistemas, soporte avanzado, BBDD y documentación técnica.",

    introKicker: "CURRÍCULUM ONLINE",
    introTitle: "Cargando CV…",
    introSub: "Perfil técnico orientado a sistemas, soporte avanzado y bases de datos.",
    introLoadingBtn: "Cargando…",
    introEntering: "Entrando…",
    enterGithubText: "Ver GitHub",
    introFootBadge: "CV público sin datos sensibles",

    navSkills: "Habilidades",
    navEducation: "Formación",
    navExperience: "Experiencia",
    navProjects: "Proyectos",

    ctaMail: "Contactar",
    ctaExperience: "Ir a mi experiencia",

    labelLocation: "Ubicación",
    labelEmail: "Email",
    labelLinkedIn: "LinkedIn",
    labelPdf: "CV PDF",
    labelFocus: "Enfoque",

    viewProfile: "Ver perfil",
    download: "Descargar",

    publicNote: "Este CV es público y no incluye datos sensibles.",

    skillsTitle: "Habilidades",
    skillsSubtitle: "Tecnologías y herramientas con las que trabajo en mi día a día.",
    educationTitle: "Formación",
    educationSubtitle: "Titulación y formación complementaria.",
    experienceTitle: "Experiencia",
    experienceHint: "Pulsa cada puesto para ver mis funciones.",
    projectsTitle: "Proyectos",
    projectsSubtitle: "Repos y material técnico que refuerzan mi perfil.",
    projectsMore: "Más en GitHub",

    expandAll: "Expandir todo",
    collapseAll: "Contraer todo",

    projectDemo: "Demo",
    projectRepo: "Repo",

    cvPdfFallbackLabel: "Descargar CV (PDF)",
    alertLoadFail: "No se pudo cargar el contenido. Revisa tus JSON en /content."
  },

  de: {
    pageTitle: "Lebenslauf | Martin Milev",
    metaDescription: "Online-Lebenslauf von Martin Milev. Systeme, erweiterter Support, Datenbanken und technische Dokumentation.",

    introKicker: "ONLINE-LEBENSLAUF",
    introTitle: "Lebenslauf wird geladen…",
    introSub: "Technisches Profil mit Fokus auf Systeme, Advanced Support und Datenbanken.",
    introLoadingBtn: "Laden…",
    introEntering: "Öffnen…",
    enterGithubText: "GitHub ansehen",
    introFootBadge: "Öffentlicher CV (keine sensiblen Daten)",

    navSkills: "Skills",
    navEducation: "Ausbildung",
    navExperience: "Erfahrung",
    navProjects: "Projekte",

    ctaMail: "Kontakt",
    ctaExperience: "Zu meiner Erfahrung",

    labelLocation: "Standort",
    labelEmail: "E-Mail",
    labelLinkedIn: "LinkedIn",
    labelPdf: "CV PDF",
    labelFocus: "Fokus",

    viewProfile: "Profil ansehen",
    download: "Herunterladen",

    publicNote: "Dieser Lebenslauf ist öffentlich und enthält keine sensiblen Daten.",

    skillsTitle: "Skills",
    skillsSubtitle: "Technologien und Tools, die ich täglich nutze.",
    educationTitle: "Ausbildung",
    educationSubtitle: "Abschlüsse und zusätzliche Weiterbildung.",
    experienceTitle: "Erfahrung",
    experienceHint: "Klicke auf jede Position, um Aufgaben zu sehen.",
    projectsTitle: "Projekte",
    projectsSubtitle: "Repos und technisches Material, das mein Profil stärkt.",
    projectsMore: "Mehr auf GitHub",

    expandAll: "Alle öffnen",
    collapseAll: "Alle schließen",

    projectDemo: "Demo",
    projectRepo: "Repo",

    cvPdfFallbackLabel: "CV herunterladen (PDF)",
    alertLoadFail: "Inhalt konnte nicht geladen werden. Prüfe deine JSON-Dateien in /content."
  }
};

function t(key){
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function setTheme(mode) {
  document.documentElement.setAttribute("data-bs-theme", mode);
  localStorage.setItem("theme", mode);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

function smoothScrollInit(){
  if (smoothScrollBound) return;
  smoothScrollBound = true;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function updateExpandBtn(){
  const acc = $("#experienceAccordion");
  const btn = $("#expandAllBtn");
  if (!btn) return;

  if (!acc) {
    btn.textContent = t("expandAll");
    return;
  }

  const collapses = acc.querySelectorAll(".accordion-collapse");
  if (!collapses.length) {
    btn.textContent = t("expandAll");
    return;
  }

  const anyClosed = Array.from(collapses).some(c => !c.classList.contains("show"));
  btn.textContent = anyClosed ? t("expandAll") : t("collapseAll");
}

function runIntroTransition(){
  const overlay = $("#introOverlay");
  const app = $("#appRoot");
  if (!overlay || !app) return;

  app.classList.remove("app-hidden");
  void app.offsetWidth;

  overlay.classList.add("is-leaving");
  app.classList.add("is-entering");

  const done = () => {
    overlay.style.display = "none";
    overlay.removeEventListener("transitionend", done);
  };
  overlay.addEventListener("transitionend", done);
}

function introInit(data){
  const gh = $("#enterGithub");
  if (gh) gh.href = data.links.github;

  const btn = $("#enterBtn");
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = t("introLoadingBtn");

  const bar = $("#introBar");
  let p = 2;

  const start = Date.now();
  const minDurationMs = 1300;
  const maxDurationMs = 3700;
  const duration = minDurationMs + Math.random() * (maxDurationMs - minDurationMs);

  const tick = () => {
    const t01 = Math.min(1, (Date.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t01, 3);
    p = Math.max(2, Math.min(100, eased * 100));

    if (bar) bar.style.width = `${p.toFixed(0)}%`;

    if (t01 < 1) requestAnimationFrame(tick);
    else {
      if (bar) bar.style.width = "100%";
      btn.innerHTML = `${t("introEntering")} <i class="bi bi-arrow-right-short"></i>`;
      setTimeout(() => {
        runIntroTransition();
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 220);
    }
  };

  requestAnimationFrame(tick);
}

function parseStackLine(stackLine){
  if (!stackLine) return [];
  const parts = stackLine
    .split(/•|,/g)
    .map(s => s.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

function setPdfLinks(data){
  const pdfUrl = (data.cvPdf || "").trim();
  const pdfLabel = (data.cvPdfLabel || t("cvPdfFallbackLabel")).trim();

  const ctaPdf = $("#ctaPdf");
  const ctaPdfText = $("#ctaPdfText");
  const profilePdf = $("#profilePdf");
  const profilePdfText = $("#profilePdfText");

  if (!pdfUrl) {
    if (ctaPdf) ctaPdf.classList.add("d-none");
    if (profilePdf) profilePdf.classList.add("d-none");
    return;
  }

  if (ctaPdf) {
    ctaPdf.href = pdfUrl;
    ctaPdf.classList.remove("d-none");
  }
  if (ctaPdfText) ctaPdfText.textContent = pdfLabel;

  if (profilePdf) {
    profilePdf.href = pdfUrl;
    profilePdf.classList.remove("d-none");
  }
  if (profilePdfText) profilePdfText.textContent = t("download");
}

function revealInit(){
  if (revealBound) return;
  revealBound = true;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    return;
  }

  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  els.forEach(el => io.observe(el));
}

function setActiveLangButton(lang){
  document.querySelectorAll(".lang-btn").forEach(b => {
    const active = (b.dataset.lang === lang);
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function setUrlLang(lang){
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
}

function applyStaticTranslations(){
  document.title = t("pageTitle");

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("metaDescription"));

  const pairs = [
    ["introKicker", "introKicker"],
    ["introTitle", "introTitle"],
    ["introSub", "introSub"],
    ["introFootBadge", "introFootBadge"],
    ["navSkills", "navSkills"],
    ["navEducation", "navEducation"],
    ["navExperience", "navExperience"],
    ["navProjects", "navProjects"],
    ["ctaMailText", "ctaMail"],
    ["ctaExpText", "ctaExperience"],
    ["labelLocation", "labelLocation"],
    ["labelEmail", "labelEmail"],
    ["labelLinkedIn", "labelLinkedIn"],
    ["labelPdf", "labelPdf"],
    ["labelFocus", "labelFocus"],
    ["profileLinkedinText", "viewProfile"],
    ["profilePdfText", "download"],
    ["publicNote", "publicNote"],
    ["skillsTitle", "skillsTitle"],
    ["skillsSubtitle", "skillsSubtitle"],
    ["educationTitle", "educationTitle"],
    ["educationSubtitle", "educationSubtitle"],
    ["experienceTitle", "experienceTitle"],
    ["experienceHint", "experienceHint"],
    ["projectsTitle", "projectsTitle"],
    ["projectsSubtitle", "projectsSubtitle"],
    ["projectsMoreText", "projectsMore"]
  ];

  pairs.forEach(([id, key]) => {
    const el = $(`#${id}`);
    if (el) el.textContent = t(key);
  });

  const enterGithub = $("#enterGithub");
  if (enterGithub) enterGithub.textContent = t("enterGithubText");

  updateExpandBtn();
}

async function fetchSiteJson(lang){
  const candidates = [
    `content/site.${lang}.json`,
    "content/site.json"
  ];

  for (const path of candidates) {
    const res = await fetch(path, { cache: "no-store" });
    if (res.ok) return res.json();
  }

  throw new Error("Site JSON not found");
}

function bindExperienceControlsOnce(){
  if (experienceBound) return;
  experienceBound = true;

  const acc = $("#experienceAccordion");
  const btn = $("#expandAllBtn");
  if (!acc || !btn) return;

  acc.addEventListener("shown.bs.collapse", updateExpandBtn);
  acc.addEventListener("hidden.bs.collapse", updateExpandBtn);

  btn.addEventListener("click", () => {
    const collapses = acc.querySelectorAll(".accordion-collapse");
    const shouldExpand = Array.from(collapses).some(c => !c.classList.contains("show"));

    collapses.forEach(c => {
      const inst = bootstrap.Collapse.getOrCreateInstance(c, { toggle: false });
      if (shouldExpand) inst.show();
      else inst.hide();
    });

    setTimeout(updateExpandBtn, 80);
  });
}

async function loadContent(lang) {
  const data = await fetchSiteJson(lang);

  $("#year").textContent = new Date().getFullYear();

  $("#brandName").textContent = data.brandName;
  $("#footerName").textContent = data.name;

  $("#profileName").textContent = data.name;
  $("#profileRole").textContent = data.role;
  $("#profileLocation").textContent = data.location;

  $("#heroBadge").textContent = data.hero.badge;
  $("#heroTitle").textContent = data.hero.title;
  $("#heroSubtitle").textContent = data.hero.subtitle;

  $("#navGithub").href = data.links.github;
  $("#projectsMore").href = data.links.github;

  const hasLinkedin = data.links.linkedin && data.links.linkedin.trim();
  if (hasLinkedin) {
    $("#navLinkedin").href = data.links.linkedin;
    $("#navLinkedin").classList.remove("d-none");

    const pl = $("#profileLinkedin");
    pl.href = data.links.linkedin;
    pl.classList.remove("d-none");
  } else {
    $("#navLinkedin").classList.add("d-none");
    $("#profileLinkedin").classList.add("d-none");
  }

  $("#profileEmail").textContent = data.links.email;
  $("#profileEmail").href = `mailto:${data.links.email}`;
  $("#ctaMail").href = `mailto:${data.links.email}`;

  // enfoque badges
  const stackWrap = $("#profileStackBadges");
  stackWrap.innerHTML = "";
  const stackItems = parseStackLine(data.stackLine);
  stackItems.forEach(item => {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = item;
    stackWrap.appendChild(b);
  });

  // pdf
  setPdfLinks(data);

  // hero tags
  const tagsWrap = $("#heroTags");
  tagsWrap.innerHTML = "";
  data.hero.tags.forEach(tt => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tt;
    tagsWrap.appendChild(span);
  });

  // skills
  const skillsGrid = $("#skillsGrid");
  skillsGrid.innerHTML = "";
  data.skills.forEach(s => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm tech-panel motion-card">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-lightning-charge"></i>
            <h3 class="h6 fw-bold mb-0">${s.title}</h3>
          </div>
          <p class="text-secondary mb-2">${s.description}</p>
          <div class="small">
            ${s.items.map(i => `<span class="badge text-bg-secondary me-1 mb-1">${i}</span>`).join("")}
          </div>
        </div>
      </div>`;
    skillsGrid.appendChild(col);
  });

  // educación / formación
  const eduGrid = $("#educationGrid");
  eduGrid.innerHTML = "";
  (data.education || []).forEach(ed => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm tech-panel motion-card">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-mortarboard"></i>
            <h3 class="h6 fw-bold mb-0">${ed.title}</h3>
          </div>
          <div class="text-secondary small mb-2">${ed.center || ""}</div>
          <div class="small text-secondary">${ed.period || ""}</div>
        </div>
      </div>`;
    eduGrid.appendChild(col);
  });

  // experiencia accordion
  const acc = $("#experienceAccordion");
  acc.innerHTML = "";
  data.experience.forEach((e, idx) => {
    const headingId = `heading_${idx}`;
    const collapseId = `collapse_${idx}`;

    const item = document.createElement("div");
    item.className = "accordion-item";
    item.innerHTML = `
      <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button collapsed" type="button"
          data-bs-toggle="collapse" data-bs-target="#${collapseId}"
          aria-expanded="false" aria-controls="${collapseId}">
          <div class="w-100 d-flex justify-content-between flex-wrap gap-2">
            <div>
              <div class="fw-bold">${e.position}</div>
              <div class="text-secondary small">${e.company}</div>
            </div>
            <div class="text-secondary small">${e.period}</div>
          </div>
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
        <div class="accordion-body">
          <ul class="mb-0">
            ${e.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
    acc.appendChild(item);
  });

  bindExperienceControlsOnce();
  updateExpandBtn();

  // proyectos
  const projGrid = $("#projectsGrid");
  projGrid.innerHTML = "";
  data.projects.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm tech-panel motion-card">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h3 class="h6 fw-bold">${p.name}</h3>
            <span class="badge text-bg-dark-subtle border">${p.type}</span>
          </div>
          <p class="text-secondary">${p.description}</p>
          <div class="mt-auto d-flex gap-2">
            ${p.demo ? `<a class="btn btn-sm btn-primary motion-btn" target="_blank" rel="noreferrer" href="${p.demo}">
              <i class="bi bi-play-circle"></i> ${t("projectDemo")}</a>` : ""}
            ${p.repo ? `<a class="btn btn-sm btn-outline-secondary motion-btn" target="_blank" rel="noreferrer" href="${p.repo}">
              <i class="bi bi-code-slash"></i> ${t("projectRepo")}</a>` : ""}
          </div>
        </div>
      </div>`;
    projGrid.appendChild(col);
  });

  // Intro solo la primera vez
  if (!introPlayed) {
    introPlayed = true;
    introInit(data);
  }

  return data;
}

function getInitialLang(){
  const url = new URL(window.location.href);
  const q = (url.searchParams.get("lang") || "").toLowerCase();
  const saved = (localStorage.getItem("lang") || "").toLowerCase();

  if (SUPPORTED_LANGS.includes(q)) return q;
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  return "en";
}

function setLanguage(lang){
  if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
  currentLang = lang;

  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;

  setActiveLangButton(lang);
  setUrlLang(lang);
  applyStaticTranslations();

  loadContent(lang).catch(err => {
    console.error(err);
    alert(t("alertLoadFail"));
  });
}

(function init(){
  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme || "dark"); // por defecto oscuro

  currentLang = getInitialLang();
  setActiveLangButton(currentLang);
  document.documentElement.lang = currentLang;

  // listeners
  const themeBtn = $("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  document.querySelectorAll(".lang-btn").forEach(b => {
    b.addEventListener("click", () => setLanguage(b.dataset.lang));
  });

  smoothScrollInit();
  revealInit();

  // textos fijos en el idioma actual
  applyStaticTranslations();

  // carga contenido del idioma actual
  loadContent(currentLang).catch(err => {
    console.error(err);
    alert(t("alertLoadFail"));
  });
})();
