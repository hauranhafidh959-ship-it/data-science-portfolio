/* ============================================================
   PORTFOLIO INTERACTIONS
   - Sticky navbar
   - Scroll-reveal animations
   - Animated skill bars
   - Typewriter effect
   - Particles background (data-science network)
   - Contact form -> FastAPI backend
   ============================================================ */

// ---------- CONFIG ----------
// NOTE: This fallback is used only if window.API_BASE is not set in index.html.
// Keep this in sync with the window.API_BASE value in index.html.
const API_BASE = window.API_BASE || "https://data-science-portfolio-ve6v.onrender.com";

// ---------- STICKY NAV ----------
const nav = document.querySelector(".navbar-custom");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 30);

  // Active link
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach((s) => {
    const top = s.offsetTop - 120;
    if (window.scrollY >= top) current = s.id;
  });
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.getAttribute("href") === "#" + current);
  });
});

// ---------- SCROLL REVEAL ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        // Skill bars
        e.target.querySelectorAll?.(".skill-fill").forEach((b) => {
          b.style.width = b.dataset.width + "%";
        });
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll("[data-anim]").forEach((el) => io.observe(el));

// ---------- TYPEWRITER ----------
const typed = document.getElementById("typed");
if (typed) {
  const roles = [
    "Data Scientist",
    "Statistician",
    "ML Engineer",
    "Data Storyteller",
  ];
  let i = 0,
    j = 0,
    del = false;
  function tick() {
    const word = roles[i];
    typed.textContent = word.slice(0, j);
    if (!del && j < word.length) j++;
    else if (del && j > 0) j--;
    else {
      del = !del;
      if (!del) i = (i + 1) % roles.length;
    }
    setTimeout(tick, del ? 60 : j === word.length ? 1400 : 110);
  }
  tick();
}

// ---------- PARTICLES (data-science network) ----------
(function particles() {
  const c = document.getElementById("particles");
  if (!c) return;
  const ctx = c.getContext("2d");
  let w, h, pts;
  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    const n = Math.min(90, Math.floor((w * h) / 22000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,211,238,.7)";
      ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x,
          dy = pts[i].y - pts[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          ctx.strokeStyle = `rgba(139,92,246,${0.18 * (1 - d2 / 14000)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize);
  resize();
  draw();
})();

// ---------- SMOOTH SCROLL & MOBILE MENU CLOSE ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: "smooth" });
      const nav = document.getElementById("mainNav");
      if (nav?.classList.contains("show"))
        bootstrap.Collapse.getInstance(nav)?.hide();
    }
  });
});

// ---------- CONTACT FORM -> FASTAPI ----------
const form = document.getElementById("contactForm");
if (form) {
  const status = document.getElementById("formStatus");

  // Validation rules for each field
  const RULES = {
    name:    { min: 1,  max: 120, label: "Name",    type: "text" },
    email:   { min: 1,  max: 200, label: "Email",   type: "email" },
    subject: { min: 0,  max: 200, label: "Subject", type: "text",  optional: true },
    message: { min: 5,  max: 4000, label: "Message", type: "text" },
  };

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function validateField(input) {
    const name = input.name;
    const rule = RULES[name];
    if (!rule) return true;

    const val = input.value.trim();
    let error = "";

    if (!rule.optional && val.length === 0) {
      error = `${rule.label} is required.`;
    } else if (val.length > 0 && val.length < rule.min) {
      error = `${rule.label} must be at least ${rule.min} characters.`;
    } else if (val.length > rule.max) {
      error = `${rule.label} must be under ${rule.max} characters.`;
    } else if (rule.type === "email" && val.length > 0 && !isValidEmail(val)) {
      error = "Please enter a valid email address.";
    }

    const wrapper = input.closest(".col-12, .col-md-6");
    let hint = wrapper && wrapper.querySelector(".field-hint");

    if (error) {
      input.classList.add("input-invalid");
      input.classList.remove("input-valid");
      if (wrapper) {
        if (!hint) {
          hint = document.createElement("span");
          hint.className = "field-hint";
          wrapper.appendChild(hint);
        }
        hint.textContent = error;
      }
      return false;
    } else {
      input.classList.remove("input-invalid");
      if (!rule.optional && val.length > 0) input.classList.add("input-valid");
      if (hint) hint.textContent = "";
      return true;
    }
  }

  // Live validation on blur and input
  form.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("input-invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields before sending
    let allValid = true;
    form.querySelectorAll("input, textarea").forEach((input) => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
      // Focus the first invalid field
      const first = form.querySelector(".input-invalid");
      if (first) first.focus();
      status.textContent = "Please fill in all required fields correctly.";
      status.className = "form-status error";
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Sending…";
    status.className = "form-status";

    const data = Object.fromEntries(new FormData(form).entries());
    // Trim all values before sending
    Object.keys(data).forEach((k) => { data[k] = data[k].trim(); });

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Server error");
      status.textContent = "✓ Thanks! Your message has been sent.";
      status.className = "form-status success";
      form.reset();
      // Clear all validation states on success
      form.querySelectorAll("input, textarea").forEach((input) => {
        input.classList.remove("input-valid", "input-invalid");
      });
      form.querySelectorAll(".field-hint").forEach((h) => (h.textContent = ""));
    } catch (err) {
      status.textContent = "Could not send: " + err.message;
      status.className = "form-status error";
    } finally {
      btn.disabled = false;
    }
  });
}

// ---------- CURRENT YEAR ----------
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();
