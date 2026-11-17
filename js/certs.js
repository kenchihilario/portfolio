
(function(){
  var modal = document.getElementById('kh-cert');
  if(!modal) return;
  var img = document.getElementById('kh-cert-img'),
      empty = document.getElementById('kh-cert-empty'),
      status = document.getElementById('kh-cert-status'),
      title = document.getElementById('kh-cert-title'),
      copy = document.getElementById('kh-cert-copy'),
      fact = document.getElementById('kh-cert-fact'),
      verify = document.getElementById('kh-cert-verify'),
      lastFocus = null;

  var CERTS = {
    ethical: {
      title: "Ethical Hacker", earned: true, statusLabel: 'Earned',
      desc: "Offensive-security fundamentals from the defender's side: reconnaissance, scanning, exploitation concepts and how to harden against them.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/ethical-hacker.png'
    },
    ctm: {
      title: "Cyber Threat Management", earned: true, statusLabel: 'Earned',
      desc: "Identifying, assessing and responding to cyber threats, from threat intelligence to incident handling.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/cyber-threat-management.png'
    },
    junior: {
      title: "Junior Cybersecurity Analyst Career Path", earned: true, statusLabel: 'Earned',
      desc: "Cisco's career path for entry-level SOC work: security fundamentals, network defense and threat handling.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/junior-analyst.png'
    },
    netdef: {
      title: "Network Defense", earned: true, statusLabel: 'Earned',
      desc: "Defending networks: access control, firewalls, monitoring and the security controls that keep traffic honest.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/network-defense.png'
    },
    intro: {
      title: "Introduction to Cybersecurity", earned: true, statusLabel: 'Earned',
      desc: "Cisco Networking Academy's intro course: cybersecurity fundamentals, common threats, and the skills the field runs on.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/intro-cybersecurity.png'
    },
    nss: {
      title: "Network Support and Security", earned: true, statusLabel: 'Earned',
      desc: "Supporting and securing networks day to day: device configuration, troubleshooting and basic security practice.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/network-support-and-security.png'
    },
    nt: {
      title: "Network Technician Career Path", earned: true, statusLabel: 'Earned',
      desc: "Cisco's technician pathway: network installation, configuration, addressing and troubleshooting.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/network-technician.png'
    },
    naddr: {
      title: "Network Addressing and Basic Troubleshooting", earned: true, statusLabel: 'Earned',
      desc: "IP addressing, subnetting and the first-line tools for diagnosing connectivity problems.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/network-addressing.png'
    },
    nbasics: {
      title: "Networking Basics", earned: true, statusLabel: 'Earned',
      desc: "How networks fit together: devices, protocols, addressing and the path a packet takes.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/networking-basics.png'
    },
    ds: {
      title: "Data Science Essentials with Python", earned: true, statusLabel: 'Earned',
      desc: "Python for data work: collecting, cleaning and analysing data with core data-science libraries.",
      fact: 'Completed via Cisco Networking Academy. Issued November 2026.',
      img: 'logos/cisco/data-science-python.png'
    },
    isc2: {
      title: 'ISC2 Candidate', statusLabel: 'Candidate',
      desc: "Candidate status with ISC2, the body behind the Certified in Cybersecurity (CC) entry-level credential.",
      fact: 'Candidate. Working toward the exam.',
      img: 'logos/cisco/isc2-candidate.png'
    },
    tesda: {
      title: 'NC II · Computer Systems Servicing', earned: true, statusLabel: 'Earned',
      desc: 'National Certificate II from TESDA: PC assembly, installation, configuration and servicing of computer systems and networks.',
      fact: 'Earned at Arandia College – Main.',
      emptyNote: 'National Certificate'
    }
  };
  function open(key){
    var c = CERTS[key]; if(!c) return;
    lastFocus = document.activeElement;
    title.textContent = c.title;
    copy.textContent = c.desc;
    fact.textContent = c.fact;
    status.textContent = c.statusLabel;
    status.classList.toggle('is-earned', !!c.earned);
    if(c.verify){ verify.href = c.verify; verify.removeAttribute('aria-disabled'); verify.classList.remove('is-off'); }
    else { verify.removeAttribute('href'); verify.setAttribute('aria-disabled','true'); verify.classList.add('is-off'); }
    if(c.img){ img.src = c.img; img.alt = c.title; img.hidden = false; empty.hidden = true; }
    else { img.removeAttribute('src'); img.hidden = true; empty.textContent = c.emptyNote || 'Certificate not uploaded yet'; empty.hidden = false; }
    modal.classList.add('is-open');
    document.body.classList.add('kh-lock');
    modal.querySelector('.kh-modal-x').focus();
  }
  function close(){
    modal.classList.remove('is-open');
    document.body.classList.remove('kh-lock');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-cert]').forEach(function(el){
    el.addEventListener('click', function(){ open(el.getAttribute('data-cert')); });
  });
  modal.addEventListener('click', function(e){ if(e.target === modal || e.target.closest('.kh-modal-x')) close(); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
})();
