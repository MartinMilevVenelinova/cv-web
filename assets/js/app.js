const $ = (s) => document.querySelector(s);

function setTheme(mode) {
  document.documentElement.setAttribute("data-bs-theme", mode);
  localStorage.setItem("theme", mode);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme") || "light";
  setTheme(current === "light" ? "dark" : "light");
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
  $("#profileStack").textContent = data.stackLine;

  $("#heroBadge").textContent = data.hero.badge;
  $("#heroTitle").textContent = data.hero.title;
  $("#heroSubtitle").textContent = data.hero.subtitle;

  $("#navGithub").href = data.links.github;
  $("#projectsMore").href = data.links.github;

  if (data.links.linkedin && data.links.linkedin.trim()) {
    $("#navLinkedin").href = data.links.linkedin;
    $("#navLinkedin").classList.remove("d-none");
  } else {
    $("#navLinkedin").classList.add("d-none");
  }

  $("#profileEmail").textContent = data.links.email;
  $("#profileEmail").href = `mailto:${data.links.email}`;
  $("#ctaMail").href = `mailto:${data.links.email}`;

  const tagsWrap = $("#heroTags");
  tagsWrap.innerHTML = "";
  data.hero.tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    tagsWrap.appendChild(span);
  });

  const skillsGrid = $("#skillsGrid");
  skillsGrid.innerHTML = "";
  data.skills.forEach(s => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
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

  const expList = $("#experienceList");
  expList.innerHTML = "";
  data.experience.forEach(e => {
    const div = document.createElement("div");
    div.className = "card border-0 shadow-sm";
    div.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between flex-wrap gap-2">
          <div>
            <div class="fw-bold">${e.position}</div>
            <div class="text-secondary">${e.company}</div>
          </div>
          <div class="text-secondary small">${e.period}</div>
        </div>
        <ul class="mt-3 mb-0">
          ${e.bullets.map(b => `<li>${b}</li>`).join("")}
        </ul>
      </div>`;
    expList.appendChild(div);
  });

  const projGrid = $("#projectsGrid");
  projGrid.innerHTML = "";
  data.projects.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
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
}

(function init(){
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);

  $("#themeBtn").addEventListener("click", toggleTheme);

  loadContent().catch(err => {
    console.error(err);
    alert("No se pudo cargar content/site.json");
  });
})();
