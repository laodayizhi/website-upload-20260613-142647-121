(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.menu-toggle');

    if (header && menuButton) {
        menuButton.addEventListener('click', function () {
            header.classList.toggle('nav-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
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

        if (next) {
            next.addEventListener('click', function () {
                stop();
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                stop();
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stop();
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    var search = document.getElementById('site-search');
    var yearFilter = document.getElementById('year-filter');
    var genreFilter = document.getElementById('genre-filter');

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(search && search.value);
        var year = normalize(yearFilter && yearFilter.value);
        var genre = normalize(genreFilter && genreFilter.value);

        document.querySelectorAll('[data-filter-card]').forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var region = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardGenre = normalize(card.getAttribute('data-genre'));
            var haystack = [title, region, cardYear, cardGenre].join(' ');
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || cardYear.indexOf(year) !== -1;
            var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
            card.classList.toggle('hidden-card', !(matchQuery && matchYear && matchGenre));
        });
    }

    [search, yearFilter, genreFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    document.querySelectorAll('.player-stage').forEach(function (stage) {
        var video = stage.querySelector('video');
        var cover = stage.querySelector('.player-cover');
        var stream = stage.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (stage.classList.contains('is-playing')) {
                            var attempt = video.play();
                            if (attempt && typeof attempt.catch === 'function') {
                                attempt.catch(function () {});
                            }
                        }
                    });
                }
            } else {
                video.src = stream;
            }
        }

        function play() {
            prepare();
            stage.classList.add('is-playing');
            if (video) {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                prepare();
            });
            video.addEventListener('play', function () {
                stage.classList.add('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
