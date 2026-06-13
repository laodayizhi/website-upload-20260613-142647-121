(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".js-hero");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        var picks = selectAll(".hero-pick", hero);
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
            picks.forEach(function (pick, i) {
                pick.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        picks.forEach(function (pick, i) {
            pick.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var list = document.getElementById("movie-list");
        if (!list) {
            return;
        }
        var cards = selectAll(".movie-card", list);
        var search = document.getElementById("movie-search");
        var region = document.getElementById("region-filter");
        var type = document.getElementById("type-filter");
        var genre = document.getElementById("genre-filter");
        var empty = document.getElementById("empty-state");
        var params = new URLSearchParams(location.search);
        if (search && params.get("q")) {
            search.value = params.get("q");
        }
        function matchText(card, value) {
            if (!value) {
                return true;
            }
            return card.textContent.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
                (card.dataset.title || "").toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
                (card.dataset.genre || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }
        function apply() {
            var q = search ? search.value.trim() : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var genreValue = genre ? genre.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matchText(card, q) &&
                    (!regionValue || card.dataset.region === regionValue) &&
                    (!typeValue || card.dataset.type === typeValue) &&
                    (!genreValue || (card.dataset.genre || "").indexOf(genreValue) !== -1);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [search, region, type, genre].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
}());

function initializeMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("play-toggle");
    var ready = false;
    var hlsInstance = null;
    if (!video || !source) {
        return;
    }
    function prepare() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }
    function play() {
        prepare();
        if (button) {
            button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }
    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });
    video.addEventListener("ended", function () {
        if (button) {
            button.classList.remove("is-hidden");
        }
    });
    prepare();
}
