
(function () {
  var form = document.getElementById('cform');
  if (!form) return;
  var MY_EMAIL = 'kenchihilario@gmail.com';

  var rules = [
    {
      input: 'cf-name', note: 'err-name',
      problem: function (text) { return text ? '' : 'Please add your name.'; }
    },
    {
      input: 'cf-from', note: 'err-from',
      problem: function (text) {
        if (!text) return 'Please add an email so I can reply.';
        var shaped = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
        return shaped ? '' : 'That email address does not look right.';
      }
    },
    {
      input: 'cf-msg', note: 'err-msg',
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
