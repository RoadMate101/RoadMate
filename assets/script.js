// RoadMate — shared site script

document.addEventListener('DOMContentLoaded', function () {
  // Header scroll state
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 60) { header.classList.add('scrolled'); }
      else { header.classList.remove('scrolled'); }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Mobile menu toggle
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal-on-scroll
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Lead forms -> Google Sheets (via Apps Script web app); falls back to email if not configured or offline
  var SHEET_ENDPOINT = ''; // paste the Apps Script web app URL here

  function sendLead(sheet, fields, form, mailTo, subject, bodyLines) {
    var btn = form.querySelector('button[type=submit]');
    var label = btn ? btn.innerHTML : '';
    var fallback = function () {
      window.location.href = 'mailto:' + mailTo + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyLines.join('\n'));
    };
    if (!SHEET_ENDPOINT) { fallback(); return; }
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    fetch(SHEET_ENDPOINT, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ sheet: sheet, page: window.location.href.split('?')[0], fields: fields })
    }).then(function () {
      var ok = form.querySelector('.form-ok');
      if (!ok) { ok = document.createElement('p'); ok.className = 'form-ok'; ok.setAttribute('role', 'status'); form.appendChild(ok); }
      ok.textContent = 'Thank you. Your details are received. Our team will call you shortly.';
      ok.style.cssText = 'margin-top:14px;padding:14px 16px;border-radius:12px;background:#0A0A0A;color:#D8BE11;font-weight:600;font-size:14.5px;';
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      fallback();
    });
  }

  // Franchise enquiry form -> "Franchise" sheet
  var form = document.getElementById('enquireForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('fname').value.trim();
      var phone = document.getElementById('fphone').value.trim();
      var district = document.getElementById('fdistrict').value;
      sendLead('franchise', { 'Name': name, 'Contact number': phone, 'District / State': district, 'Source': 'Website enquiry form' }, form,
        'franchise@roadmate.in', 'RoadMate Franchise Enquiry — ' + (district || 'India'),
        ['Name: ' + name, 'Contact Number: ' + phone, 'District / State: ' + district]);
    });
  }

  // Partnership onboarding forms -> "Partnership" sheet
  document.querySelectorAll('form.onboard-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var role = f.getAttribute('data-role');
      var lines = ['Onboarding type: ' + role];
      var fields = { 'Partner type': role };
      f.querySelectorAll('.field').forEach(function (fd) {
        var l = fd.querySelector('label');
        var i = fd.querySelector('input,select,textarea');
        if (!l || !i) { return; }
        var v = (i.value || '').trim();
        var k = l.textContent.replace(/\s*\*\s*$/, '').trim();
        fields[k] = v;
        lines.push(k + ': ' + (v || '-'));
      });
      var nameEl = document.getElementById(f.getAttribute('data-name-field'));
      var who = (nameEl && nameEl.value.trim()) || 'New request';
      sendLead('partnership', fields, f, 'partners@roadmate.in', 'RoadMate ' + role + ' Onboarding — ' + who, lines);
    });
  });

  // Apps page tabs (prototype iframes load on first view)
  var tabs = document.querySelectorAll('.app-tab');
  if (tabs.length) {
    var ids = [];
    tabs.forEach(function (t) { ids.push(t.getAttribute('data-app')); });
    var show = function (id) {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-app') === id ? 'true' : 'false');
      });
      document.querySelectorAll('.app-panel').forEach(function (p) {
        var on = p.id === 'panel-' + id;
        p.classList.toggle('active', on);
        if (on) {
          var fr = p.querySelector('iframe[data-src]');
          if (fr) { fr.src = fr.getAttribute('data-src'); fr.removeAttribute('data-src'); }
        }
      });
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var id = t.getAttribute('data-app');
        show(id);
        if (window.history && history.replaceState) { history.replaceState(null, '', '#' + id); }
      });
    });
    var h = window.location.hash.replace('#', '');
    show(ids.indexOf(h) > -1 ? h : ids[0]);
  }
});
