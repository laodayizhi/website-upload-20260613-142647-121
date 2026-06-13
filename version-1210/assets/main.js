(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.hidden = expanded;
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let index = 0;
    let timer = null;

    const activate = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const schedule = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    };

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        schedule();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.dataset.slide || 0));
        schedule();
      });
    });

    schedule();
  }

  const filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    const input = filterBar.querySelector("[data-filter-input]");
    const region = filterBar.querySelector("[data-filter-region]");
    const year = filterBar.querySelector("[data-filter-year]");
    const type = filterBar.querySelector("[data-filter-type]");
    const items = Array.from(document.querySelectorAll(".search-item"));
    const empty = document.querySelector(".empty-state");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    const normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    const apply = function () {
      const keyword = normalize(input && input.value);
      const regionValue = normalize(region && region.value);
      const yearValue = normalize(year && year.value);
      const typeValue = normalize(type && type.value);
      let visible = 0;

      items.forEach(function (item) {
        const text = normalize(item.dataset.search);
        const itemRegion = normalize(item.dataset.region);
        const itemYear = normalize(item.dataset.year);
        const itemType = normalize(item.dataset.type);
        const matched = (!keyword || text.includes(keyword)) &&
          (!regionValue || itemRegion === regionValue) &&
          (!yearValue || itemYear === yearValue) &&
          (!typeValue || itemType === typeValue);

        item.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.setupVideoPlayer = function (videoId, overlayId, streamUrl) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (!video || !streamUrl) {
      return;
    }

    let attached = false;

    const attach = function () {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 36,
          backBufferLength: 24
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    };

    const play = function () {
      attach();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      const result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
  };
})();
