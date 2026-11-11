/* Site behaviour: theme toggle, mobile menu, active section, BibTeX panels. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Theme toggle (choice kept in localStorage) ---------- */
  var themeBtn = document.querySelector('.theme-btn');
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return media && media.matches ? 'dark' : 'light';
  }
  function labelThemeBtn() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    themeBtn.setAttribute('title', 'Switch to ' + next + ' theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      labelThemeBtn();
    });
    if (media && media.addEventListener) media.addEventListener('change', labelThemeBtn);
    labelThemeBtn();
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var navList = document.getElementById('nav-list');

  function setMenu(open) {
    if (!menuBtn || !navList) return;
    navList.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      setMenu(open);
      if (open) { var first = navList.querySelector('a'); if (first) first.focus(); }
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-header')) setMenu(false);
    });
  }

  /* ---------- Highlight the nav link of the section in view ---------- */
  var navLinks = {};
  document.querySelectorAll('.nav-list a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  var sections = document.querySelectorAll('main section[id], #contact');
  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // data-nav lets a section without its own link light up a parent link
        var key = entry.target.getAttribute('data-nav') || entry.target.id;
        Object.keys(navLinks).forEach(function (k) {
          var on = k === key;
          navLinks[k].classList.toggle('active', on);
          if (on) navLinks[k].setAttribute('aria-current', 'location');
          else navLinks[k].removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- BibTeX: open inline, copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  document.querySelectorAll('[data-bib-toggle]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });

  document.querySelectorAll('[data-bib-copy]').forEach(function (btn) {
    var panel = btn.closest('.bib');
    var status = panel.querySelector('.copy-status');
    btn.addEventListener('click', function () {
      var text = panel.querySelector('pre').textContent.trim();
      copyText(text).then(function () {
        status.textContent = 'Copied';
      }, function () {
        status.textContent = 'Copy failed. Select the text and copy it.';
      });
      setTimeout(function () { status.textContent = ''; }, 2500);
    });
  });

  /* ---------- Collaboration form: send through Web3Forms without leaving the page ---------- */
  var form = document.querySelector('.collab-form');
  if (form && window.fetch && window.FormData) {
    var formStatus = form.querySelector('.form-status');
    var sendBtn = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      if (data.botcheck) return; // ticked by a bot
      sendBtn.disabled = true;
      formStatus.className = 'form-status';
      formStatus.textContent = 'Sending…';
      fetch(form.getAttribute('data-ajax'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (String(res.success) !== 'true') throw new Error(res.message || 'not sent');
        form.reset();
        formStatus.textContent = 'Thank you. Your message is on its way, and I will reply by email.';
      }).catch(function () {
        // The form service did not answer: keep what the visitor wrote as an email draft
        var lines = [];
        Array.prototype.forEach.call(form.elements, function (f) {
          if (f.name && ['access_key', 'subject', 'from_name', 'redirect', 'botcheck'].indexOf(f.name) < 0 && f.type !== 'submit' && f.value) {
            lines.push(f.name + ': ' + f.value);
          }
        });
        var href = 'mailto:' + form.getAttribute('data-mailto') +
          '?subject=' + encodeURIComponent('Research collaboration request') +
          '&body=' + encodeURIComponent(lines.join('\n'));
        var link = document.createElement('a');
        link.href = href;
        link.textContent = 'Send it from your email app instead';
        formStatus.className = 'form-status error';
        formStatus.textContent = 'The message could not be sent from this page. ';
        formStatus.appendChild(link);
      }).then(function () { sendBtn.disabled = false; });
    });
  }

  /* ---------- View count: daily totals from GoatCounter, written by a GitHub Action ---------- */
  var views = document.querySelector('.view-count');
  if (views && window.fetch) {
    fetch(views.getAttribute('data-src'), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (!d || typeof d.total !== 'number' || d.total < 1) return;
        var el = function (tag, cls, text) {
          var n = document.createElement(tag);
          if (cls) n.className = cls;
          if (text != null) n.textContent = text;
          return n;
        };
        views.appendChild(el('b', null, d.total.toLocaleString('en')));
        views.appendChild(el('span', 'lbl', 'views'));
        var tip = d.total.toLocaleString('en') + ' total views';
        var countries = (d.countries || []).filter(function (c) { return /^[a-z]{2}$/.test(c.code); });
        if (countries.length) {
          views.appendChild(el('span', null, '·')).setAttribute('aria-hidden', 'true');
          countries.forEach(function (c) {
            var item = el('span', 'country');
            var flag = el('img');
            flag.src = 'https://flagcdn.com/w40/' + c.code + '.png';
            flag.alt = c.name;
            flag.title = c.name;
            flag.width = 18;
            flag.height = 14;
            flag.loading = 'lazy';
            item.appendChild(flag);
            item.appendChild(el('b', null, c.count.toLocaleString('en')));
            views.appendChild(item);
          });
          tip += '. Top countries: ' + countries.map(function (c) { return c.name + ' ' + c.count; }).join(', ');
        }
        views.title = tip + '. Counted with GoatCounter, without cookies.';
        views.hidden = false;
      })
      .catch(function () { /* no stats yet: keep the pill hidden */ });
  }
})();
