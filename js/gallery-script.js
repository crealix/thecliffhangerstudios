// JS: Image popup
const popup = document.querySelector('.popup');
const popupImg = document.querySelector('.popup-content');
const closeBtn = document.querySelector('.close');
const galleryImages = document.querySelectorAll('.gallery-item img');

if (popup && popupImg) {
  galleryImages.forEach(img => {
    img.addEventListener('click', () => {
      popup.style.display = 'flex';
      popupImg.src = img.src;
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });
}

// Float Menu
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
}

// Back to Top button
const backToTopBtn = document.getElementById('backToTopBtn');

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
