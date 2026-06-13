(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (panel) {
        var scope = panel.parentElement;
        var searchInput = panel.querySelector('[data-search]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var yearMatched = !year || text.indexOf(year) !== -1;
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !(yearMatched && keywordMatched));
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !overlay || !source) {
        return;
    }

    function attachSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function play() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
