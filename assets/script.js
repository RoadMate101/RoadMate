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
 
  // Simple enquiry form -> mailto
  var form = document.getElementById('enquireForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('fname').value.trim();
      var phone = document.getElementById('fphone').value.trim();
      var district = document.getElementById('fdistrict').value;
 
      var subject = encodeURIComponent('RoadMate Partnership Enquiry — ' + (district || 'India'));
      var body = encodeURIComponent(
        'Name: ' + name +
        '\nContact Number: ' + phone +
        '\nDistrict / State: ' + district
      );
      window.location.href = 'mailto:franchise@roadmate.in?subject=' + subject + '&body=' + body;
    });
  }
});
