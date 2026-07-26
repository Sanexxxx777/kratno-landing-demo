(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stagger reveal
  var batch = [];
  var flush;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      batch.push(e.target);
      io.unobserve(e.target);
    });
    if (batch.length && !flush) {
      flush = requestAnimationFrame(function () {
        batch.forEach(function (el, i) {
          el.style.transitionDelay = reduce ? '0s' : (i * 55) + 'ms';
          el.classList.add('in');
        });
        batch = [];
        flush = null;
      });
    }
  }, { threshold: 0.05, rootMargin: '0px 0px 220px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // number counters
  function tween(el) {
    var text = el.textContent;
    var m = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return;
    var raw = m[1];
    var comma = raw.indexOf(',') > -1;
    var target = parseFloat(raw.replace(',', '.'));
    var decimals = (raw.split(/[.,]/)[1] || '').length;
    var start = null, dur = 650;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      if (comma) val = val.replace('.', ',');
      el.textContent = text.replace(raw, val);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    var seen = new WeakSet();
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          tween(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px 220px 0px' });
    document.querySelectorAll('.stat b, .hero-chip b, .case-card__nums b, .case-nums b, .nums b').forEach(function (el) { cio.observe(el); });
  }

  // header shadow
  var head = document.querySelector('.site-head');
  if (head) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (es) {
      head.classList.toggle('scrolled', !es[0].isIntersecting);
    }).observe(sentinel);
  }

  // lead modal
  var modal = document.getElementById('lead-modal');
  if (modal) {
    var lastFocus = null;
    function openModal(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      var first = modal.querySelector('input');
      if (first) first.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-modal-open]').forEach(function (el) {
      el.addEventListener('click', openModal);
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
    var form = modal.querySelector('[data-lead-form]');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      modal.classList.add('sent');
      modal.querySelector('.modal__ok').classList.add('show');
      setTimeout(function () {
        closeModal();
        setTimeout(function () { modal.classList.remove('sent'); form.reset(); }, 400);
      }, 2200);
    });
  }

  // hero photo parallax
  var heroImg = document.querySelector('.hero-visual img');
  if (heroImg && !reduce) {
    var pTick = false;
    addEventListener('scroll', function () {
      if (pTick) return;
      pTick = true;
      requestAnimationFrame(function () {
        var y = Math.min(scrollY, 700);
        heroImg.style.transform = 'translateY(' + (y * 0.1) + 'px) scale(1.06)';
        pTick = false;
      });
    }, { passive: true });
  }
})();
