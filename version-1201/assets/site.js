(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var list = document.querySelector('[data-search-list]');
  var input = document.querySelector('[data-search-input]');
  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get('q') || '';

  if (input && query) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch() {
    if (!list) {
      return;
    }
    var value = normalize(input ? input.value : query);
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
    });
  }

  if (input && list) {
    input.addEventListener('input', applySearch);
    applySearch();
  } else if (list && query) {
    applySearch();
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var value = button.getAttribute('data-filter-category') || '';
      filterButtons.forEach(function(item) {
        item.classList.toggle('active', item === button);
      });
      if (input) {
        input.value = value;
      }
      applySearch();
    });
  });
})();
