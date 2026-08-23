(() => {
  const buttons = Array.from(document.querySelectorAll(".page-button"));
  const panelContainer = document.getElementById("page-container");

  function initCarousel() {
    document.querySelectorAll(".carousel").forEach(carousel => {
      if (carousel.dataset.initialized) return;
      carousel.dataset.initialized = "true";

      const track = carousel.querySelector(".carousel-track");
      const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
      const prevBtn = carousel.querySelector(".carousel-btn.prev");
      const nextBtn = carousel.querySelector(".carousel-btn.next");
      const indicatorsContainer = carousel.querySelector(".carousel-indicators");
      if (!track || !slides.length || !indicatorsContainer) return;

      let currentIndex = 0;
      const goToSlide = index => {
        currentIndex = (index + slides.length) % slides.length;
        track.style.transform = `translateX(${-currentIndex * 100}%)`;
        indicatorsContainer.querySelectorAll("button").forEach((btn, i) => {
          btn.disabled = i === currentIndex;
        });
      };

      slides.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = i + 1;
        btn.addEventListener("click", () => goToSlide(i));
        indicatorsContainer.appendChild(btn);
      });

      prevBtn?.addEventListener("click", () => goToSlide(currentIndex - 1));
      nextBtn?.addEventListener("click", () => goToSlide(currentIndex + 1));
      goToSlide(0);
    });
  }

  function initPanorama() {
    document.querySelectorAll(".panorama-container").forEach(container => {
      if (container.dataset.initialized) return;
      container.dataset.initialized = "true";

      const panorama = container.querySelector(".panorama");
      if (!panorama) return;

      let dragging = false;
      let startX = 0;
      let currentTranslate = 0;

      const getMaxTranslate = () =>
        Math.max(panorama.scrollWidth - container.clientWidth, 0);

      const move = clientX => {
        const dx = clientX - startX;
        startX = clientX;
        currentTranslate = Math.max(0, Math.min(currentTranslate - dx, getMaxTranslate()));
        panorama.style.transform = `translate3d(${-currentTranslate}px,0,0)`;
      };

      container.addEventListener("pointerdown", e => {
        dragging = true;
        startX = e.clientX;
        container.setPointerCapture?.(e.pointerId);
        container.style.cursor = "grabbing";
      });
      container.addEventListener("pointermove", e => {
        if (dragging) move(e.clientX);
      });
      const stop = () => {
        dragging = false;
        container.style.cursor = "grab";
      };
      container.addEventListener("pointerup", stop);
      container.addEventListener("pointercancel", stop);
      container.addEventListener("lostpointercapture", stop);

      // Recalculate after images/layout are ready, not while the tab is hidden.
      panorama.addEventListener("load", () => { currentTranslate = 0; }, { once: true });
    });
  }

  function initPortfolio() {
    const lightbox = document.getElementById("portfolio-lightbox");
    if (!lightbox || lightbox.dataset.initialized) return;
    lightbox.dataset.initialized = "true";

    const image = document.getElementById("lightbox-image");
    const caption = document.getElementById("lightbox-caption");
    const close = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      image.src = "";
      document.body.style.overflow = "";
    };

    lightbox.querySelectorAll(".lightbox-trigger").forEach(trigger => {
      trigger.addEventListener("click", () => {
        image.src = trigger.dataset.image;
        image.alt = trigger.dataset.title || "";
        caption.textContent = trigger.dataset.title || "";
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", close);
    lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) close();
    });
  }

  function showPage(name, button) {
    const template = document.getElementById(`route-${name}`);
    if (!template) return;

    panelContainer.innerHTML = template.innerHTML;
    buttons.forEach(b => {
      const active = b === button;
      b.disabled = active;
      b.setAttribute("aria-current", active ? "page" : "false");
    });

    if (name === "Projects") {
      initCarousel();
      initPanorama();
    }
    if (name === "Portfolio") initPortfolio();

    window.scrollTo({ top: Math.max(0, panelContainer.getBoundingClientRect().top + window.scrollY - 24), behavior: "smooth" });
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page, button));
  });

  document.addEventListener("click", e => {
    const jump = e.target.closest(".jump-page");
    if (!jump) return;
    const target = buttons.find(b => b.dataset.page === jump.dataset.page);
    if (target) {
      showPage(target.dataset.page, target);
      document.querySelector(".page-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  showPage("Portfolio", buttons[0]);
})();