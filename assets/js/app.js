const $ = (s) => document.querySelector(s);

function setTheme(mode) {
  document.documentElement.setAttribute("data-bs-theme", mode);
  localStorage.setItem("theme", mode);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}

function smoothScrollInit(){
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
  if (!acc || !btn) return;

  const collapses = acc.querySelectorAll(".accordion-collapse");
  if (!collapses.length) return;

  const anyClosed = Array.from(collapses).some(c => !c.classList.contains("show"));
  btn.textContent = anyClosed ? "Expandir todo" : "Contraer todo";
}

function runIntroTransition(){
  const overlay = $("#introOverlay");
  const app = $("#appRoot");

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
  $("#enterGithub").href = data.links.github;

  const btn = $("#enterBtn");
  btn.disabled = true;

  const bar = $("#introBar");
  let p = 2;

  const start = Date.now();
  const minDurationMs = 9500;
  const maxDurationMs = 13500;
  const duration = minDurationMs + Math.random() * (maxDurationMs - minDurationMs);

  const tick = () => {
    const t = Math.min(1, (Date.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const noise = (Math.random() - 0.5) * 1.2;
    p = Math.max(2, Math.min(100, eased * 100 + noise));
    bar.style.width = `${p.toFixed(0)}%`;

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      bar.style.width = "100%";
      btn.innerHTML = 'Entrando... <i class="bi bi-arrow-right-short"></i>';
      setTimeout(() => {
        runIntroTransition();
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 450);
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
  const pdfLabel = (data.cvPdfLabel || "Descargar CV (PDF)").trim();

  const ctaPdf = $("#ctaPdf");
  const ctaPdfText = $("#ctaPdfText");
  const profilePdf = $("#profilePdf");

  // si no hay pdf configurado, lo ocultamos y ya
  if (!pdfUrl) {
    if (ctaPdf) ctaPdf.classList.add("d-none");
    if (profilePdf) profilePdf.classList.add("d-none");
    return;
  }

  // hero button
  if (ctaPdf) {
    ctaPdf.href = pdfUrl;
    ctaPdf.classList.remove("d-none");
  }
  if (ctaPdfText) ctaPdfText.textContent = pdfLabel;

  // tarjeta lateral
  if (profilePdf) {
    profilePdf.href = pdfUrl;
    profilePdf.classList.remove("d-none");
  }
}

async function loadContent() {
  const res = await fetch("content/site.json", { cache: "no-store" });
  const data = await res.json();

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

  // pdf links (hero + tarjeta)
  setPdfLinks(data);

  // tags hero
  const tagsWrap = $("#heroTags");
  tagsWrap.innerHTML = "";
  data.hero.tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    tagsWrap.appendChild(span);
  });

  // skills
  const skillsGrid = $("#skillsGrid");
  skillsGrid.innerHTML = "";
  data.skills.forEach(s => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm tech-panel">
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

  acc.addEventListener("shown.bs.collapse", updateExpandBtn);
  acc.addEventListener("hidden.bs.collapse", updateExpandBtn);

  $("#expandAllBtn").addEventListener("click", () => {
    const collapses = acc.querySelectorAll(".accordion-collapse");
    const shouldExpand = Array.from(collapses).some(c => !c.classList.contains("show"));

    collapses.forEach(c => {
      const inst = bootstrap.Collapse.getOrCreateInstance(c, { toggle: false });
      if (shouldExpand) inst.show();
      else inst.hide();
    });

    setTimeout(updateExpandBtn, 80);
  });

  updateExpandBtn();

  // proyectos
  const projGrid = $("#projectsGrid");
  projGrid.innerHTML = "";
  data.projects.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm tech-panel">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <h3 class="h6 fw-bold">${p.name}</h3>
            <span class="badge text-bg-dark-subtle border">${p.type}</span>
          </div>
          <p class="text-secondary">${p.description}</p>
          <div class="mt-auto d-flex gap-2">
            ${p.demo ? `<a class="btn btn-sm btn-primary" target="_blank" rel="noreferrer" href="${p.demo}">
              <i class="bi bi-play-circle"></i> Demo</a>` : ""}
            ${p.repo ? `<a class="btn btn-sm btn-outline-secondary" target="_blank" rel="noreferrer" href="${p.repo}">
              <i class="bi bi-code-slash"></i> Repo</a>` : ""}
          </div>
        </div>
      </div>`;
    projGrid.appendChild(col);
  });

  introInit(data);
  smoothScrollInit();

  return data;
}

(function init(){
  const saved = localStorage.getItem("theme");
  setTheme(saved || "dark"); // por defecto oscuro

  $("#themeBtn").addEventListener("click", toggleTheme);

  loadContent().catch(err => {
    console.error(err);
    alert("No se pudo cargar content/site.json");
  });
})();
