(function () {
  const ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  ready(function () {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    const slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
      const next = slider.querySelector("[data-hero-next]");
      const prev = slider.querySelector("[data-hero-prev]");
      let index = 0;
      let timer = null;

      const show = function (target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };

      const play = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          play();
        });
      });

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      play();
    }

    const filter = document.querySelector("[data-filter]");
    const grid = document.querySelector("[data-card-grid]");

    if (filter && grid) {
      const search = filter.querySelector("[data-filter-search]");
      const type = filter.querySelector("[data-filter-type]");
      const region = filter.querySelector("[data-filter-region]");
      const year = filter.querySelector("[data-filter-year]");
      const empty = filter.querySelector("[data-empty-result]");
      const cards = Array.from(grid.querySelectorAll(".movie-card, .ranking-row"));
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q") || "";

      if (search && initialQuery) {
        search.value = initialQuery;
      }

      const apply = function () {
        const q = search ? search.value.trim().toLowerCase() : "";
        const typeValue = type ? type.value : "";
        const regionValue = region ? region.value : "";
        const yearValue = year ? year.value : "";
        let visible = 0;

        cards.forEach(function (card) {
          const haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          const matchQuery = !q || haystack.indexOf(q) !== -1;
          const matchType = !typeValue || card.getAttribute("data-type") === typeValue;
          const matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          const matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          const matched = matchQuery && matchType && matchRegion && matchYear;

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      [search, type, region, year].forEach(function (input) {
        if (!input) {
          return;
        }
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });

      apply();
    }
  });
})();
