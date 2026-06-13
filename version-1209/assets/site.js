(function () {
    "use strict";

    function siteBase() {
        return window.SITE_BASE || "./";
    }

    function withBase(path) {
        if (!path) {
            return siteBase();
        }
        if (/^(https?:)?\/\//.test(path) || path.startsWith("#")) {
            return path;
        }
        return siteBase() + path.replace(/^\.\//, "");
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                stop();
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                stop();
                show(current + 1);
                start();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    function searchableText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
    }

    function initLocalFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
        var quickInputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter-input"));

        function applyFilter(input) {
            var section = input.closest("section") || document;
            var scope = section.querySelector("[data-filter-scope]") || document.querySelector("[data-filter-scope]");
            if (!scope) {
                return;
            }
            var query = (input.value || "").trim().toLowerCase();
            var toolbar = input.closest("[data-category-filter]");
            var year = toolbar && toolbar.querySelector(".filter-year") ? toolbar.querySelector(".filter-year").value : "";
            var type = toolbar && toolbar.querySelector(".filter-type") ? toolbar.querySelector(".filter-type").value : "";
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var text = searchableText(card);
                var matchQuery = !query || text.indexOf(query) >= 0;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var matchType = !type || card.getAttribute("data-type") === type;
                var shouldShow = matchQuery && matchYear && matchType;
                card.classList.toggle("is-hidden-by-filter", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            var count = toolbar ? toolbar.querySelector(".filter-count") : null;
            if (count) {
                count.textContent = "显示 " + visible + " 部";
            }
        }

        quickInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                applyFilter(input);
            });
        });

        toolbars.forEach(function (toolbar) {
            Array.prototype.slice.call(toolbar.querySelectorAll("select")).forEach(function (select) {
                select.addEventListener("change", function () {
                    var input = toolbar.querySelector(".local-filter-input");
                    if (input) {
                        applyFilter(input);
                    }
                });
            });
        });
    }

    function initGlobalSearch() {
        var input = document.getElementById("globalSearchInput");
        var results = document.getElementById("globalSearchResults");
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !results || !data.length) {
            return;
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到相关影片</strong><small>请尝试其他关键词</small></div></div>';
                results.classList.add("open");
                return;
            }
            results.innerHTML = items.slice(0, 12).map(function (item) {
                return [
                    '<a class="search-result-item" href="' + withBase(item.url) + '">',
                    '<img src="' + withBase(item.cover) + '" alt="' + escapeHtml(item.title) + ' 缩略图" loading="lazy">',
                    '<span>',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</small>',
                    '</span>',
                    '</a>'
                ].join("");
            }).join("");
            results.classList.add("open");
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                results.classList.remove("open");
                results.innerHTML = "";
                return;
            }
            var matches = data.filter(function (item) {
                return [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(" "), item.oneLine]
                    .join(" ")
                    .toLowerCase()
                    .indexOf(query) >= 0;
            });
            render(matches);
        });

        document.addEventListener("click", function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove("open");
            }
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader="true"]');
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    function playVideo(video, url) {
        if (!video || !url) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = url;
                video.play().catch(function () {});
            }
        });
    }

    function initPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".play-cover"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-video-target");
                var url = button.getAttribute("data-hls");
                var video = document.getElementById(targetId);
                button.classList.add("hidden");
                playVideo(video, url);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initLocalFilters();
        initGlobalSearch();
        initPlayers();
    });
})();
