(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        function hideMissingImage() {
            image.classList.add('image-missing');
        }

        image.addEventListener('error', hideMissingImage);

        if (image.complete && image.naturalWidth === 0) {
            hideMissingImage();
        }
    });

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.trim() : '';
            var target = 'search.html';

            if (keyword) {
                target += '?q=' + encodeURIComponent(keyword);
            }

            window.location.href = target;
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (heroTimer || slides.length <= 1) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5600);
    }

    function resetHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
            heroTimer = null;
        }

        startHero();
    }

    if (slides.length) {
        showHero(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showHero(heroIndex - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showHero(heroIndex + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
            resetHero();
        });
    });

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var resultCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] [data-movie-card]'));
    var typeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
    var activeType = '';

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function filterCards() {
        if (!resultCards.length) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

        resultCards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-keywords') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || ''
            ].join(' ').toLowerCase();
            var typeValue = card.getAttribute('data-type') || '';
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            var typeMatched = !activeType || typeValue === activeType;

            card.classList.toggle('hidden', !(keywordMatched && typeMatched));
        });
    }

    if (searchInput) {
        searchInput.value = getQueryValue();
        searchInput.addEventListener('input', filterCards);
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards();
        });
    }

    typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeType = button.getAttribute('data-filter-type') || '';

            typeButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            filterCards();
        });
    });

    filterCards();
})();
