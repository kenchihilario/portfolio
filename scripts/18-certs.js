
(function () {
  var panel = document.getElementById('cm');
  if (!panel) return;

  var parts = {
    frame: document.getElementById('cm-shot'),
    img: document.getElementById('cm-img'),
    empty: document.getElementById('cm-empty'),
    emptyText: document.getElementById('cm-empty-txt'),
    status: document.getElementById('cm-status'),
    title: document.getElementById('cm-title'),
    text: document.getElementById('cm-copy'),
    fact: document.getElementById('cm-fact'),
    verify: document.getElementById('cm-verify'),
    pdf: document.getElementById('cm-pdf')
  };
  var defaultEmptyText = parts.emptyText ? parts.emptyText.textContent : 'Certificate not uploaded yet';

  var CISCO_NOTE = 'Completed via Cisco Networking Academy. Issued November 2026.';

  var BADGES = 'https://www.credly.com/badges/';
  var CREDLY = {
    ccna1: 'e23aa8f3-40fe-47f6-8bfb-70902cdbf7d6',
    ctm: '52899aef-c8dc-42d6-bfa2-c505823b696e',
    ds: 'ff21ea7d-babc-41f9-8e5c-32c6ac004460',
    ethical: '53d868dc-fd21-40ec-bd33-17967cedc05b',
    intro: '00f6bed4-3802-4946-9c16-e927bd1df9f0',
    junior: '1465856b-74dd-4afc-b13d-ffeca811b6b8',
    naddr: '66b42e6d-61fe-4b39-9de4-1cdab5ed0b3e',
    nbasics: 'df94e21f-0c19-4528-aacf-d7448f20f7db',
    netdef: '06aea681-deaa-47b7-a403-444c9f9cd220',
    nss: '603477bd-ee89-45d7-813c-90f97373d461',
    nt: '0ae8c966-855a-4062-a1a5-ab62c8af700f'
  };

  function cisco(key, title, about) {
    return { title: title, earned: true, label: 'Earned', about: about,
             fact: CISCO_NOTE, image: 'certs/' + key + '.webp',
             pdf: 'certs/' + key + '.pdf', verify: BADGES + CREDLY[key] };
  }

  var CERTS = {
    ccna1: cisco('ccna1', 'CCNA: Introduction to Networks',
      'First course of the Cisco CCNA series: switching and routing basics, Ethernet, IPv4 and IPv6 addressing, and building and securing a small network.'),
    ethical: cisco('ethical', 'Ethical Hacker',
      "Offensive-security fundamentals from the defender's side: reconnaissance, scanning, exploitation concepts and how to harden against them."),
    ctm: cisco('ctm', 'Cyber Threat Management',
      'Identifying, assessing and responding to cyber threats, from threat intelligence to incident handling.'),
    junior: cisco('junior', 'Junior Cybersecurity Analyst Career Path',
      "Cisco's career path for entry-level SOC work: security fundamentals, network defense and threat handling."),
    netdef: cisco('netdef', 'Network Defense',
      'Defending networks: access control, firewalls, monitoring and the security controls that keep traffic honest.'),
    intro: cisco('intro', 'Introduction to Cybersecurity',
      "Cisco Networking Academy's intro course: cybersecurity fundamentals, common threats, and the skills the field runs on."),
    nss: cisco('nss', 'Network Support and Security',
      'Supporting and securing networks day to day: device configuration, troubleshooting and basic security practice.'),
    nt: cisco('nt', 'Network Technician Career Path',
      "Cisco's technician pathway: network installation, configuration, addressing and troubleshooting."),
    naddr: cisco('naddr', 'Network Addressing and Basic Troubleshooting',
      'IP addressing, subnetting and the first-line tools for diagnosing connectivity problems.'),
    nbasics: cisco('nbasics', 'Networking Basics',
      'How networks fit together: devices, protocols, addressing and the path a packet takes.'),
    ds: cisco('ds', 'Data Science Essentials with Python',
      'Python for data work: collecting, cleaning and analysing data with core data-science libraries.'),
    mech: {
      title: 'NC II · Mechatronics', label: 'In progress',
      about: 'National Certificate II from TESDA, trained at Metrologyx Training and Assessment Center, Inc. in Manila. Training ran from September 28 to October 26, 2026.',
      fact: 'Assessment scheduled for Nov 24, 2026. Not earned yet.',
      emptyNote: 'Assessment pending'
    },
    ccna2: {
      title: 'CCNA: Switching, Routing, and Wireless Essentials', label: 'In progress',
      about: 'Second course of the Cisco CCNA series: switching, routing and wireless essentials. Instructor-led through Cisco Networking Academy at Synertech Academy.',
      fact: 'In progress, Oct 2026 to May 2027. Not earned yet.',
      emptyNote: 'Course in progress'
    },
    isc2: {
      title: 'ISC2 Candidate', label: 'Candidate',
      about: 'Candidate status with ISC2, the body behind the Certified in Cybersecurity (CC) entry-level credential.',
      fact: 'Candidate. Working toward the exam.',
      image: 'logos/cisco/isc2-candidate.png'
    },
    tesda: {
      title: 'NC II · Computer Systems Servicing', earned: true, label: 'Earned',
      about: 'National Certificate II from TESDA: PC assembly, installation, configuration and servicing of computer systems and networks.',
      fact: 'Earned at Arandia College – Main.',
      emptyNote: 'National Certificate'
    }
  };

  function aimVerify(url) {
    var a = parts.verify;
    if (!a) return;
    if (url) a.href = url; else a.removeAttribute('href');
    a.classList.toggle('kh-pop-btn-off', !url);
    if (url) { a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }
    else { a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1; }
  }

  function aimPdf(url) {
    var a = parts.pdf;
    if (!a) return;
    if (url) { a.href = url; a.hidden = false; }
    else { a.removeAttribute('href'); a.hidden = true; }
  }

  function showPicture(cert) {
    parts.frame.classList.remove('is-broken');

    parts.img.hidden = false;
    if (cert.image) {
      parts.img.src = cert.image;
      parts.img.alt = cert.title;
      parts.img.style.display = '';
      parts.empty.hidden = true;
    } else {
      parts.img.style.display = 'none';

      parts.img.removeAttribute('src');
      if (parts.emptyText) parts.emptyText.textContent = cert.emptyNote || defaultEmptyText;
      parts.empty.hidden = false;
    }
  }

  function open(key) {
    var cert = CERTS[key];
    if (!cert) return;
    parts.title.textContent = cert.title;
    parts.text.textContent = cert.about;
    parts.fact.textContent = cert.fact;
    parts.status.textContent = cert.label;
    parts.status.classList.toggle('is-earned', Boolean(cert.earned));
    aimVerify(cert.verify);
    aimPdf(cert.pdf);
    showPicture(cert);
    document.body.classList.add('kh-pop-open');
    panel.classList.add('on');
  }

  function close() {
    panel.classList.remove('on');
    document.body.classList.remove('kh-pop-open');
    parts.img.removeAttribute('src');
  }

  document.querySelectorAll('[data-cert]').forEach(function (trigger) {
    var key = trigger.getAttribute('data-cert');
    trigger.addEventListener('click', function (e) { e.stopPropagation(); open(key); });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(key); }
    });
  });

  panel.addEventListener('click', function (e) {
    if (e.target === panel || e.target.closest('.kh-pop-x')) close();
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
