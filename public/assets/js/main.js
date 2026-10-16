(function () {
  var form = document.getElementById('quote-form');
  var status = document.getElementById('q-status');
  var btn = form.querySelector('button[type=submit]');
  document.getElementById('q-started').value = Date.now();
  function show(msg, ok) { status.textContent = msg; status.className = 'form-msg' + (ok ? ' ok' : ''); status.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      var bad = form.querySelector(':invalid');
      show('Please fill in the highlighted fields: name, email, phone, service, from and to.', false);
      if (bad) bad.focus();
      form.querySelectorAll(':invalid').forEach(function (el) { el.style.borderColor = 'var(--signal)'; });
      return;
    }
    form.querySelectorAll('input,select').forEach(function (el) { el.style.borderColor = ''; });
    var data = new FormData(form);
    var endpoint = form.dataset.endpoint;
    if (endpoint) {
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          document.getElementById('q-started').value = Date.now();
          show('Thanks, your request has been sent. We will reply within one business day.', true);
        })
        .catch(function () { show('The request could not be sent. Please email us at ' + form.dataset.email + '.', false); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Send request →'; });
      return;
    }
    var lines = [];
    data.forEach(function (v, k) { if (v) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v); });
    var href = 'mailto:' + form.dataset.email +
      '?subject=' + encodeURIComponent('Quote request: ' + data.get('service') + ' to ' + data.get('to')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    show('Your email app should open with these details filled in. If it does not, email us at ' + form.dataset.email + '.', true);
  });
})();
