// RoadMate ad landing page: lead form, UTM capture, optional Meta Pixel
(function () {
  // Put your Meta Pixel ID between the quotes to track leads. Leave empty to disable.
  var META_PIXEL_ID = '';
  var SHEET_ENDPOINT = ''; // paste the Apps Script web app URL here (same one as assets/script.js)
  var LEAD_ENDPOINT = 'https://formsubmit.co/ajax/franchise@roadmate.in';

  if (META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) { return; } n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) { f._fbq = n; } n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  var params = new URLSearchParams(window.location.search);
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(function (k) {
    if (params.get(k)) { utm[k] = params.get(k); }
  });

  var wrap = document.getElementById('lpForm');
  var form = document.getElementById('lpLead');
  if (!form || !wrap) { return; }
  var msg = document.getElementById('lpMsg');
  var btn = form.querySelector('button[type=submit]');

  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'lp-msg'; msg.textContent = '';
    if (form.querySelector('.hp input').value) { return; }
    var phone = val('lp_phone').replace(/[^0-9+]/g, '');
    if (phone.replace(/\D/g, '').length < 10) {
      msg.className = 'lp-msg err'; msg.textContent = 'Please enter a valid 10-digit contact number.'; return;
    }
    var data = {
      'Full name': val('lp_name'),
      'Contact number': phone,
      'District / State': val('lp_loc'),
      'Territory of interest': val('lp_tier'),
      'Industry of interest': val('lp_ind'),
      'Best time to call': val('lp_time'),
      'Source': 'Meta ad landing page',
      'Page': window.location.href.split('?')[0],
      '_subject': 'New franchise lead (Meta ad): ' + val('lp_name'),
      '_template': 'table',
      '_captcha': 'false'
    };
    Object.keys(utm).forEach(function (k) { data[k] = utm[k]; });

    btn.disabled = true; var label = btn.innerHTML; btn.textContent = 'Sending...';
    var req = SHEET_ENDPOINT
      ? fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ sheet: 'franchise', page: window.location.href.split('?')[0], fields: data }) }).then(function () { return { ok: true, json: function () { return {}; } }; })
      : fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    req.then(function (r) {
      if (!r.ok) { throw new Error('bad status'); }
      return r.json();
    }).then(function (j) {
      if (j && (j.success === 'false' || j.success === false)) { throw new Error('rejected'); }
      if (window.fbq) { window.fbq('track', 'Lead'); }
      wrap.classList.add('done');
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(function () {
      btn.disabled = false; btn.innerHTML = label;
      var body = Object.keys(data).filter(function (k) { return k.charAt(0) !== '_'; })
        .map(function (k) { return k + ': ' + data[k]; }).join('\n');
      var href = 'mailto:franchise@roadmate.in?subject=' + encodeURIComponent('RoadMate Franchise Enquiry — ' + val('lp_name')) + '&body=' + encodeURIComponent(body);
      msg.className = 'lp-msg err';
      msg.innerHTML = 'We could not send your details just now. Please <a href="' + href + '" style="text-decoration:underline;font-weight:700;">tap here to email us instead</a>.';
    });
  });
})();
