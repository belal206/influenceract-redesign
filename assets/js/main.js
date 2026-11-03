// Submissions go to Netlify Forms (Netlify dashboard → Forms → "contact").
// Opened as a local file there is nowhere to post, so it just shows the success state.
const FORM_ENDPOINT = location.protocol.startsWith("http") ? "/" : "";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// scroll progress + nav shadow
const progress = document.getElementById("progress");
const nav = document.querySelector("nav.top");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${scrollY / max})`;
  nav.classList.toggle("scrolled", scrollY > 20);
}, { passive: true });

// reveal on scroll + count-ups
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".rv, .steps").forEach((el) => io.observe(el));

function countUp(el) {
  const target = +el.dataset.count, plus = el.hasAttribute("data-plus");
  if (reduced) { el.textContent = target.toLocaleString("en-IN") + (plus ? "+" : ""); return; }
  const start = performance.now(), dur = 1400;
  const tick = (t) => {
    const p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString("en-IN") + (plus && p === 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if (finePointer && !reduced) {
  // 3D tilt + spotlight on cards
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 7}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  // magnetic buttons
  document.querySelectorAll(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  // hero: cursor glow
  const hero = document.getElementById("hero"), glow = document.getElementById("cursorGlow");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    glow.style.left = e.clientX - r.left + "px";
    glow.style.top = e.clientY - r.top + "px";
  });

  // grow section: parallax photo stack
  const grow = document.getElementById("grow");
  const photos = document.querySelectorAll("#stack .ph");
  grow.addEventListener("pointermove", (e) => {
    const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
    photos.forEach((p) => {
      const d = +p.dataset.depth;
      p.style.setProperty("--px", dx * -d + "px");
      p.style.setProperty("--py", dy * -d + "px");
    });
  });
}

// form
const form = document.getElementById("joinForm");
const card = document.getElementById("formCard");
const phone = document.getElementById("phone");
const meter = document.getElementById("meter");
const help = document.getElementById("help");
// keep only digits, drop a leading 91 / 0 so "+91 98765 43210" and "098765..." both work
const digits = (v) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

const checks = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  company: (v) => v.trim().length > 1,
  phone: (v) => /^[6-9]\d{9}$/.test(digits(v)),
  help: (v) => !!v,
};

// completion meter fills as fields become valid
function updateMeter() {
  const total = Object.keys(checks).length;
  const done = Object.entries(checks).filter(([id, ok]) => ok(document.getElementById(id).value)).length;
  meter.style.width = (done / total) * 100 + "%";
}

form.addEventListener("input", (e) => {
  const f = e.target.closest(".field");
  if (f) {
    f.classList.remove("err");
    if (checks[e.target.id]) f.classList.toggle("ok", checks[e.target.id](e.target.value));
  }
  updateMeter();
});
form.addEventListener("change", updateMeter);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let firstBad = null;
  for (const [id, ok] of Object.entries(checks)) {
    const input = document.getElementById(id);
    const f = input.closest(".field");
    f.classList.remove("err"); void f.offsetWidth; // restart shake animation
    const bad = !ok(input.value);
    f.classList.toggle("err", bad);
    if (bad && !firstBad) firstBad = input;
  }
  if (firstBad) { firstBad.focus(); return; }

  const data = Object.fromEntries(new FormData(form));
  data.phone = "+91" + digits(data.phone);

  const btn = form.querySelector("button"), label = btn.querySelector(".label");
  btn.disabled = true; label.textContent = "Sending…";
  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });
      if (!res.ok) throw new Error(res.status);
    }
    card.classList.add("done");
    confetti();
  } catch {
    btn.disabled = false; label.textContent = "Try again";
    alert("Something went wrong. Please try again, or email contactus@influenceract.com.");
  }
});

function confetti() {
  if (reduced) return;
  const colors = ["#4f00b3", "#e8343a", "#dc74f2", "#ebe1ff"];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.top = -20 - Math.random() * 120 + "px";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 2 + Math.random() * 2 + "s";
    c.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(c);
    c.addEventListener("animationend", () => c.remove());
  }
}
