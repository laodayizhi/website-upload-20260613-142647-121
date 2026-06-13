(function () {
  'use strict';

  function getRootPrefix() {
    return document.body ? (document.body.getAttribute('data-root-prefix') || '') : '';
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previousButton = carousel.querySelector('[data-hero-prev]');
    var nextButton = carousel.querySelector('[data-hero-next]');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5500);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startAutoPlay();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        startAutoPlay();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initLocalFilter() {
    var form = document.querySelector('[data-local-filter]');
    var container = document.querySelector('[data-card-container]');
    var emptyState = document.querySelector('[data-empty-state]');
    if (!form || !container) {
      return;
    }

    var input = form.querySelector('[data-filter-input]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = normalise(input ? input.value : '');
      var typeValue = normalise(typeSelect ? typeSelect.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchable = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
        var matchesType = !typeValue || searchable.indexOf(typeValue) !== -1;
        var shouldShow = matchesKeyword && matchesType;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
  }

  function loadHlsLibrary(cdnUrl) {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existing = document.querySelector('script[data-hls-library]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = cdnUrl;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-hls-library', 'true');
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var button = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      if (!button) {
        return;
      }

      button.addEventListener('click', function () {
        startPlayer(player, message);
      });
    });
  }

  function startPlayer(player, message) {
    var source = player.getAttribute('data-video-source');
    var title = player.getAttribute('data-video-title') || '视频';
    var poster = player.getAttribute('data-video-poster') || '';
    var cdnUrl = player.getAttribute('data-hls-cdn') || 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';

    if (!source) {
      setPlayerMessage(message, '当前条目没有可用播放源。');
      return;
    }

    var video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('title', title);
    if (poster) {
      video.poster = poster;
    }

    player.innerHTML = '';
    player.appendChild(video);
    setPlayerMessage(null, '');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    loadHlsLibrary(cdnUrl).then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            player.appendChild(createPlayerNotice('播放源加载失败，请稍后重试或更换网络环境。'));
          }
        });
      } else {
        player.appendChild(createPlayerNotice('当前浏览器暂不支持 HLS 播放。'));
      }
    }).catch(function () {
      player.appendChild(createPlayerNotice('HLS 播放组件加载失败，请检查网络。'));
    });
  }

  function setPlayerMessage(message, text) {
    if (message) {
      message.textContent = text;
    }
  }

  function createPlayerNotice(text) {
    var notice = document.createElement('div');
    notice.className = 'player-message';
    notice.textContent = text;
    return notice;
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var form = document.querySelector('[data-search-page-form]');
    var categorySelect = document.querySelector('[data-search-category]');
    var yearSelect = document.querySelector('[data-search-year]');
    var movieIndex = window.MOVIE_INDEX || [];

    if (!results || !form || !movieIndex.length) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    populateYears(movieIndex, yearSelect);

    function performSearch() {
      var query = normalise(input ? input.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var filtered = movieIndex.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.categoryLabel].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !category || movie.categorySlug === category;
        var matchesYear = !year || movie.year === year;
        return matchesQuery && matchesCategory && matchesYear;
      }).slice(0, 120);

      renderSearchResults(filtered, results);
      if (status) {
        status.textContent = '找到 ' + filtered.length + ' 条结果' + (filtered.length === 120 ? '，已显示前 120 条。' : '。');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      performSearch();
    });
    if (categorySelect) {
      categorySelect.addEventListener('change', performSearch);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', performSearch);
    }
    if (input) {
      input.addEventListener('input', debounce(performSearch, 160));
    }

    performSearch();
  }

  function populateYears(movieIndex, select) {
    if (!select) {
      return;
    }
    var years = Array.from(new Set(movieIndex.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort(function (a, b) {
      return Number(b) - Number(a);
    });
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });
  }

  function renderSearchResults(items, container) {
    container.innerHTML = items.map(function (movie) {
      return [
        '<article class="movie-card poster">',
        '  <a class="movie-poster" href="' + escapeAttribute(movie.url) + '">',
        '    <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + ' 在线观看" loading="lazy">',
        '    <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
        '    <span class="movie-play-hint">播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.categoryLabel) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function debounce(callback, wait) {
    var timeout = null;
    return function () {
      var context = this;
      var args = arguments;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(function () {
        callback.apply(context, args);
      }, wait);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initSearchForms();
    initLocalFilter();
    initPlayers();
    initSearchPage();
  });
})();
