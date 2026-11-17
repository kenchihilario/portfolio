(function () {
  var roles = document.querySelector('.kh-xp');
  if (!roles) return;

  function setOpen(row, open) {
    row.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  roles.addEventListener('click', function (event) {
    var row = event.target.closest('.kh-xp-row');
    if (!row) return;

    var sel = window.getSelection();
    if (sel && String(sel).trim() && row.contains(sel.anchorNode)) return;

    var wasOpen = row.getAttribute('aria-expanded') === 'true';
    roles.querySelectorAll('.kh-xp-row').forEach(function (r) { setOpen(r, false); });
    setOpen(row, !wasOpen);
  });
})();

(function () {
  var form = document.getElementById('msg-form');
  if (!form) return;
  var MY_EMAIL = 'kenchihilario@gmail.com';

  var rules = [
    {
      input: 'mf-name', note: 'mf-err-name',
      problem: function (text) { return text ? '' : 'Please add your name.'; }
    },
    {
      input: 'mf-from', note: 'mf-err-from',
      problem: function (text) {
        if (!text) return 'Please add an email so I can reply.';
        var shaped = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
        return shaped ? '' : 'That email address does not look right.';
      }
    },
    {
      input: 'mf-msg', note: 'mf-err-msg',
      problem: function (text) {
        if (!text) return 'Tell me a little about the role.';
        return text.length < 10 ? 'Could you add a bit more detail?' : '';
      }
    }
  ];

  function field(rule) { return document.getElementById(rule.input); }
  function valueOf(rule) { return field(rule).value.trim(); }

  function report(rule, message) {
    var input = field(rule);
    var slot = document.getElementById(rule.note);
    slot.textContent = message;
    slot.classList.toggle('on', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !message;
  }

  rules.forEach(function (rule) {
    var input = field(rule);
    input.addEventListener('input', function () {
      var flagged = input.getAttribute('aria-invalid') === 'true';
      if (flagged && !rule.problem(valueOf(rule))) report(rule, '');
    });
    input.addEventListener('blur', function () {
      if (valueOf(rule)) report(rule, rule.problem(valueOf(rule)));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    var badCount = 0;
    rules.forEach(function (rule) {
      if (!report(rule, rule.problem(valueOf(rule)))) {
        badCount += 1;
        if (!firstBad) firstBad = field(rule);
      }
    });
    if (firstBad) {
      firstBad.focus();
      var detail = badCount === 1 ? 'One field needs attention.' : badCount + ' fields need attention.';
      window.toast('err', 'Not sent', detail, { center: true, life: 2800 });
      return;
    }

    var name = valueOf(rules[0]);
    var subject = 'Portfolio enquiry from ' + (name || 'a visitor');
    var body = valueOf(rules[2]) + '\n\n-\n' + name + '\n' + valueOf(rules[1]);
    window.toast('ok', 'Opening your mail app',
      'The draft is addressed to ' + MY_EMAIL + '. If nothing opens, write to that address directly.');
    window.location.href = 'mailto:' + MY_EMAIL +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();

(function () {
  var bar = document.getElementById('topbar');
  var hero = document.querySelector('.kh-hero');
  var home = document.getElementById('back-top');
  if (home) home.addEventListener('click', function () { window.scrollTo(0, 0); });
  if (!bar || !hero) return;

  var watcher = new IntersectionObserver(function (entries) {
    bar.classList.toggle('on', !entries[0].isIntersecting);
  }, { rootMargin: '-70px 0px 0px 0px' });
  watcher.observe(hero);
})();
