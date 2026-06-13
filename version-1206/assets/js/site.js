(function () {
    "use strict";

    const root = document.body.dataset.root || "./";
    const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function withRoot(path) {
        if (!path) {
            return root;
        }
        if (/^https?:\/\//i.test(path) || path.startsWith("#")) {
            return path;
        }
        return root + path.replace(/^\.\//, "");
    }

    function initMobileMenu() {
        const toggle = document.querySelector("[data-mobile-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.classList.toggle("is-active");
        });
    }

    function initGlobalSearch() {
        document.querySelectorAll("[data-global-search]").forEach(function (form) {
            const input = form.querySelector("[data-global-search-input]");
            const results = form.querySelector("[data-global-search-results]");
            if (!input || !results) {
                return;
            }

            function render(query) {
                const keyword = normalize(query);
                if (!keyword) {
                    results.innerHTML = "";
                    results.classList.remove("is-open");
                    return;
                }

                const matches = searchIndex.filter(function (item) {
                    const haystack = normalize([
                        item.title,
                        item.region,
                        item.type,
                        item.year,
                        item.genre,
                        item.tags,
                        item.oneLine,
                        item.category
                    ].join(" "));
                    return haystack.includes(keyword);
                }).slice(0, 10);

                if (!matches.length) {
                    results.innerHTML = '<div data-listing-empty>没有找到匹配内容</div>';
                    results.classList.add("is-open");
                    return;
                }

                results.innerHTML = matches.map(function (item) {
                    return [
                        '<a class="search-result-item" href="' + withRoot(item.url) + '">',
                        '    <img src="' + withRoot(item.cover) + '" alt="' + escapeHtml(item.title) + '" data-fallback-image="' + escapeHtml(item.title) + '">',
                        '    <span>',
                        '        <strong>' + escapeHtml(item.title) + '</strong>',
                        '        <small>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</small>',
                        '        <small>' + escapeHtml(item.oneLine) + '</small>',
                        '    </span>',
                        '</a>'
                    ].join("");
                }).join("");
                results.classList.add("is-open");
                attachImageFallback(results);
            }

            input.addEventListener("input", function () {
                render(input.value);
            });

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const firstLink = results.querySelector("a");
                if (firstLink) {
                    window.location.href = firstLink.href;
                }
            });

            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove("is-open");
                }
            });
        });
    }

    function initHeroCarousel() {
        const carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        let activeIndex = 0;
        let timer = null;

        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function initListingControls() {
        document.querySelectorAll("[data-listing-section]").forEach(function (section) {
            const controls = section.querySelector("[data-listing-controls]");
            const grid = section.querySelector("[data-listing-grid]");
            if (!controls || !grid) {
                return;
            }

            const search = controls.querySelector("[data-listing-search]");
            const filters = Array.from(controls.querySelectorAll("[data-listing-filter]"));
            const count = controls.querySelector("[data-listing-count]");
            const cards = Array.from(grid.querySelectorAll(".movie-card"));
            const empty = document.createElement("div");
            empty.setAttribute("data-listing-empty", "");
            empty.textContent = "没有找到匹配影片，请尝试其他关键词或筛选条件。";

            function apply() {
                const keyword = normalize(search ? search.value : "");
                const activeFilters = {};
                filters.forEach(function (filter) {
                    activeFilters[filter.dataset.listingFilter] = normalize(filter.value);
                });

                let visibleCount = 0;
                cards.forEach(function (card) {
                    const text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.category,
                        card.textContent
                    ].join(" "));
                    const matchesKeyword = !keyword || text.includes(keyword);
                    const matchesFilters = Object.keys(activeFilters).every(function (key) {
                        const value = activeFilters[key];
                        return !value || normalize(card.dataset[key]).includes(value);
                    });
                    const shouldShow = matchesKeyword && matchesFilters;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visibleCount += 1;
                    }
                });

                if (count) {
                    count.textContent = "显示 " + visibleCount + " / " + cards.length;
                }

                if (!visibleCount) {
                    if (!empty.parentNode) {
                        grid.appendChild(empty);
                    }
                } else if (empty.parentNode) {
                    empty.parentNode.removeChild(empty);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            filters.forEach(function (filter) {
                filter.addEventListener("change", apply);
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            const video = player.querySelector("video");
            const playButton = player.querySelector("[data-player-play]");
            if (!video || !playButton) {
                return;
            }

            function destroyHls() {
                if (player.hlsInstance) {
                    player.hlsInstance.destroy();
                    player.hlsInstance = null;
                }
            }

            function loadAndPlay() {
                const source = player.dataset.m3u8;
                if (!source) {
                    return;
                }
                destroyHls();
                playButton.classList.add("is-hidden");

                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    player.hlsInstance = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            playButton.classList.remove("is-hidden");
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            playButton.classList.remove("is-hidden");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {
                        playButton.classList.remove("is-hidden");
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        playButton.classList.remove("is-hidden");
                    });
                }
            }

            playButton.addEventListener("click", loadAndPlay);
            video.addEventListener("play", function () {
                playButton.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    playButton.classList.remove("is-hidden");
                }
            });

            document.querySelectorAll("[data-source-button]").forEach(function (button) {
                button.addEventListener("click", function () {
                    document.querySelectorAll("[data-source-button]").forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    player.dataset.m3u8 = button.dataset.src || player.dataset.m3u8;
                    video.pause();
                    video.removeAttribute("src");
                    video.load();
                    destroyHls();
                    loadAndPlay();
                });
            });
        });
    }

    function attachImageFallback(scope) {
        const container = scope || document;
        container.querySelectorAll("img[data-fallback-image]").forEach(function (image) {
            if (image.dataset.fallbackAttached) {
                return;
            }
            image.dataset.fallbackAttached = "true";
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.removeAttribute("src");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initGlobalSearch();
        initHeroCarousel();
        initListingControls();
        initPlayers();
        attachImageFallback(document);
    });
}());
