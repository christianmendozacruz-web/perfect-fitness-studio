(function () {
  'use strict';
  var T = window.PF_TPL || {};
  var BRANCH = document.body.getAttribute('data-branch') || '';
  var WA = '525644121830';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  // Fill {{ a.b }} holes; keys ending in "Html" are inserted raw.
  function fill(tpl, scope) {
    return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function (_, path) {
      var parts = path.split('.'), v = scope;
      for (var i = 0; i < parts.length; i++) { v = v == null ? '' : v[parts[i]]; }
      if (v == null) v = '';
      return /Html$/.test(parts[parts.length - 1]) ? v : esc(v);
    });
  }

  /* ---------- Menu ---------- */
  var drawer = $('#pf-drawer');
  var openBtn = $('[data-menu-open]');
  function setMenu(open) {
    if (!drawer) return;
    drawer.style.display = open ? 'block' : 'none';
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  $$('[data-menu-close]').forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Slider (Conoce el estudio) ---------- */
  var N = 7, cur = 0;
  function showSlide(i) {
    cur = ((i % N) + N) % N;
    $$('[data-sl-img]').forEach(function (el) {
      var on = +el.getAttribute('data-sl-img') === cur;
      el.style.opacity = on ? '1' : '0';
      if (el.tagName === 'IMG') el.style.transform = 'scale(' + (on ? 1 : 1.06) + ')';
    });
    $$('[data-sl-txt]').forEach(function (el) {
      var k = +el.getAttribute('data-sl-txt'), on = k === cur;
      el.style.opacity = on ? '1' : '0';
      el.style.transform = 'translateY(' + (on ? '0px' : (k < cur ? '-24px' : '24px')) + ')';
      el.style.pointerEvents = on ? 'auto' : 'none';
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $$('[data-sl-dot]').forEach(function (el) {
      el.style.background = +el.getAttribute('data-sl-dot') === cur ? '#D9BD16' : '#3D3936';
    });
    var c = $('#pf-sl-cur'); if (c) c.textContent = '0' + (cur + 1);
  }
  var prev = $('[data-prev]'), next = $('[data-next]');
  if (prev) prev.addEventListener('click', function () { showSlide(cur - 1); });
  if (next) next.addEventListener('click', function () { showSlide(cur + 1); });
  $$('[data-go]').forEach(function (el) { el.addEventListener('click', function () { showSlide(+el.getAttribute('data-go')); }); });
  var box = $('#pf-sl-box'), tx = 0;
  if (box) {
    box.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) showSlide(cur + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Horarios y reservas ---------- */
  var SCHEDULE = [
    { name: 'Lunes', classes: [['8:00 AM', 'Indoor'], ['9:30 AM', 'Yoga'], ['6:00 PM', 'Yoga'], ['7:30 PM', 'Indoor']] },
    { name: 'Martes', classes: [['9:00 AM', 'Baile Fit'], ['10:00 AM', 'Meditación'], ['6:00 PM', 'Heels'], ['8:00 PM', 'Indoor']] },
    { name: 'Miércoles', classes: [['8:30 AM', 'Indoor'], ['10:00 AM', 'Yoga'], ['6:00 PM', 'Yoga'], ['7:30 PM', 'Salsa']] },
    { name: 'Jueves', classes: [['8:30 AM', 'Indoor'], ['10:00 AM', 'Yoga'], ['7:00 PM', 'Yoga'], ['8:15 PM', 'Heels / Jazz']] },
    { name: 'Viernes', classes: [['8:00 AM', 'Meditación'], ['9:30 AM', 'Zumba'], ['7:00 PM', 'Indoor'], ['8:30 PM', 'Ritmos latinos']] }
  ];
  var CLR = { 'Indoor': '#FF8A3D', 'Yoga': '#4FD1A5', 'Meditación': '#8FA8FF', 'Baile Fit': '#FF6FB1', 'Heels': '#D77CFF', 'Heels / Jazz': '#D77CFF', 'Salsa': '#FF6B6B', 'Zumba': '#F5D547', 'Ritmos latinos': '#38C6F4' };
  var LEGEND = [['Indoor', '#FF8A3D'], ['Yoga', '#4FD1A5'], ['Meditación', '#8FA8FF'], ['Baile Fit', '#FF6FB1'], ['Heels / Jazz', '#D77CFF'], ['Salsa', '#FF6B6B'], ['Zumba', '#F5D547'], ['Ritmos latinos', '#38C6F4']];
  var SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  var wd = new Date().getDay();
  var state = { pick: null, mDay: (wd >= 1 && wd <= 5) ? wd - 1 : 0 };

  function classObj(d, di, c, ci) {
    var id = di + '-' + ci, sel = state.pick && state.pick.id === id;
    return { id: id, time: c[0], name: c[1], color: CLR[c[1]] || '#DDB3F5', pressed: sel ? 'true' : 'false', bg: sel ? '#2A1733' : '#1E1C1B', border: sel ? '#D9BD16' : '#2E2B29' };
  }
  function renderSchedule() {
    var leg = $('#pf-legend');
    if (leg && !leg.innerHTML) leg.innerHTML = LEGEND.map(function (x) { return fill(T.legend, { lg: { name: x[0], color: x[1] } }); }).join('');
    var days = $('#pf-days');
    if (days) days.innerHTML = SCHEDULE.map(function (d, di) {
      var cls = d.classes.map(function (c, ci) { return fill(T.cls, { c: classObj(d, di, c, ci) }); }).join('');
      return fill(T.day, { day: { name: d.name, classesHtml: cls } });
    }).join('');
    var tabs = $('#pf-tabs');
    if (tabs) tabs.innerHTML = SCHEDULE.map(function (d, i) {
      var on = state.mDay === i;
      return fill(T.tab, { t: { i: i, name: d.name, short: SHORT[i], selected: on ? 'true' : 'false', bg: on ? '#D9BD16' : '#1E1C1B', border: on ? '#D9BD16' : '#2E2B29', color: on ? '#151413' : '#F5F5F0' } });
    }).join('');
    var mc = $('#pf-mclasses');
    if (mc) {
      var d = SCHEDULE[state.mDay];
      mc.innerHTML = d.classes.map(function (c, ci) { return fill(T.mcls, { c: classObj(d, state.mDay, c, ci) }); }).join('');
    }
  }
  function renderBooking() {
    var p = state.pick;
    var show = function (id, on, mode) { var el = $(id); if (el) el.style.display = on ? (mode || 'contents') : 'none'; };
    show('#pf-nopick', !p); show('#pf-haspick', !!p);
    if (p) {
      $('#pf-pickname').textContent = p.name;
      $('#pf-pickwhen').textContent = p.day + ' · ' + p.time;
    }
    var nameEl = $('#pf-nombre'), first = $('#pf-first');
    var name = nameEl ? nameEl.value.trim() : '';
    var ok = !!p && name.length > 1;
    show('#pf-cansend', ok); show('#pf-cantsend', !ok);
    if (ok) {
      var msg = 'Hola, quiero reservar mi lugar en ' + (BRANCH === 'pachuca' ? 'la sucursal Pachuca: ' : '') + p.name + ' el ' + p.day.toLowerCase() + ' a las ' + p.time + '.\nNombre: ' + name + '\nPrimera clase: ' + (first && first.checked ? 'Sí' : 'No');
      $('#pf-wa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-pick],[data-tab],[data-clear],[data-faq]') : null;
    if (!t) return;
    if (t.hasAttribute('data-pick')) {
      var ids = t.getAttribute('data-pick').split('-'), d = SCHEDULE[+ids[0]], c = d.classes[+ids[1]];
      state.pick = { id: t.getAttribute('data-pick'), day: d.name, time: c[0], name: c[1] };
      renderSchedule(); renderBooking();
      var panel = $('#clase-muestra'); if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (t.hasAttribute('data-tab')) {
      state.mDay = +t.getAttribute('data-tab'); renderSchedule();
    } else if (t.hasAttribute('data-clear')) {
      state.pick = null; renderSchedule(); renderBooking();
    } else if (t.hasAttribute('data-faq')) {
      var i = +t.getAttribute('data-faq'); faqOpen = faqOpen === i ? -1 : i; renderFaq();
    }
  });
  var nm = $('#pf-nombre'); if (nm) nm.addEventListener('input', renderBooking);
  var fc = $('#pf-first'); if (fc) fc.addEventListener('change', renderBooking);

  /* ---------- FAQ ---------- */
  var FAQ = window.PF_FAQ || [], faqOpen = 0;
  function renderFaq() {
    var box = $('#pf-faqs'); if (!box) return;
    box.innerHTML = FAQ.map(function (f, i) {
      var open = faqOpen === i;
      var ans = open ? fill(T.ans, { f: { a: f[1] } }) : '';
      return fill(T.faq, { f: { i: i, q: f[0], ansHtml: ans, expanded: open ? 'true' : 'false', border: open ? '#D9BD16' : '#2E2B29', iconBg: open ? '#D9BD16' : '#2E2B29', iconFg: open ? '#151413' : '#F5F5F0', rot: open ? '45deg' : '0deg' } });
    }).join('');
  }

  renderSchedule(); renderBooking(); renderFaq(); showSlide(0);
})();
