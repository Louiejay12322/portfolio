(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Image fallbacks (portrait initials, hide broken images) ---------- */
  const portrait = document.querySelector(".portrait");
  if (portrait) {
    const fail = () => portrait.parentElement.classList.add("no-img");
    portrait.addEventListener("error", fail);
    if (portrait.complete && portrait.naturalWidth === 0) fail();
  }

  /* ---------- Reveal on scroll (with stagger inside each section) ---------- */
  document.querySelectorAll("section").forEach((section) => {
    section.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.setProperty("--d", `${Math.min(i, 6) * 90}ms`);
    });
  });

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("show"));
  }

  /* ---------- Nav state, scroll progress, back-to-top ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const toTop = document.getElementById("toTop");

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (nav) nav.classList.toggle("scrolled", y > 20);
    if (toTop) toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll("#navLinks a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navIo.observe(s));
  }

  /* ---------- Rotating headline word ---------- */
  const rotator = document.getElementById("rotator");
  const words = ["busy work.", "inbox.", "follow-ups.", "repetitive tasks."];
  if (rotator && !reduceMotion) {
    let i = 0;

    const cycleRotator = () => {
      rotator.classList.remove("swap");
      rotator.classList.add("changing");

      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        void rotator.offsetWidth;
        rotator.classList.remove("changing");
        rotator.classList.add("swap");
      }, 180);
    };

    setInterval(cycleRotator, 2800);
    rotator.classList.add("swap");
  }

  /* ---------- Animated workflow demo ---------- */
  const steps = [...document.querySelectorAll(".flow-step")];
  const lines = [...document.querySelectorAll(".flow-line")];
  if (steps.length) {
    let current = 0;
    const activate = (idx) => {
      steps.forEach((s, i) => s.classList.toggle("active", i === idx));
      if (idx > 0 && lines[idx - 1]) {
        const line = lines[idx - 1];
        line.classList.remove("pulse");
        void line.offsetWidth; // restart animation
        line.classList.add("pulse");
      }
    };
    activate(0);
    if (!reduceMotion) {
      setInterval(() => {
        current = (current + 1) % steps.length;
        activate(current);
      }, 1600);
    }
  }

  /* ---------- Cursor spotlight on cards ---------- */
  document.querySelectorAll(".spotlight").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Certificate lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const certOpen = document.getElementById("certOpen");
  const lightboxClose = document.getElementById("lightboxClose");
  if (lightbox && certOpen && typeof lightbox.showModal === "function") {
    certOpen.addEventListener("click", () => lightbox.showModal());
    lightboxClose?.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied!";
        btn.classList.add("copied");
      } catch {
        btn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1800);
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (form) {
    const fields = ["name", "email", "message"].map((id) => document.getElementById(id));

    fields.forEach((f) =>
      f.addEventListener("input", () => f.classList.remove("invalid"))
    );

    // Messages are delivered to this inbox by FormSubmit (free, no account needed).
    const FORM_ENDPOINT = "https://formsubmit.co/ajax/louiejaysolitana12@gmail.com";
    const submitBtn = document.getElementById("submitBtn");
    const submitLabel = submitBtn?.querySelector("span");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      fields.forEach((f) => {
        const valid = f.value.trim() !== "" && f.checkValidity();
        f.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        note.textContent = "Please fill in every field with a valid email.";
        note.className = "form-note err";
        return;
      }

      const [name, email, message] = fields.map((f) => f.value.trim());

      submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending…";
      note.textContent = "";
      note.className = "form-note";

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name,
            email,
            message,
            _replyto: email,
            _subject: `New project inquiry from ${name}`,
            _template: "table",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false || data.success === "false") {
          throw new Error(data.message || `Request failed (${res.status})`);
        }

        note.textContent = `Thanks, ${name}! Your message was sent. I'll reply to ${email} soon.`;
        note.className = "form-note ok";
        form.reset();
      } catch (err) {
        console.error("Contact form error:", err);
        note.textContent =
          "Sorry, your message couldn't be sent. Please try again, or email me directly at louiejaysolitana12@gmail.com.";
        note.className = "form-note err";
      } finally {
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = "Send message";
      }
    });
  }
})();