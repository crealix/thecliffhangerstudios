// Fade-in elements on scroll
const fadeEls = document.querySelectorAll('.fade-in');

const appearOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('appear');
    }
  });
}, {
  threshold: 0.2
});

fadeEls.forEach(el => {
  appearOnScroll.observe(el);
});

// Navbar toggle for mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// FAQ
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const icon = item.querySelector('.toggle-icon');

    if (!question.classList.contains('disabled')) {
      question.addEventListener('click', () => {
        item.classList.toggle('active');
        icon.textContent = item.classList.contains('active') ? '−' : '+';
      });
    }
  });