 // JS: Image popup 
 const popup = document.querySelector('.popup');
    const popupImg = document.querySelector('.popup-content');
    const closeBtn = document.querySelector('.close');
    const galleryImages = document.querySelectorAll('.gallery-item img');

    galleryImages.forEach(img => {
      img.addEventListener('click', () => {
        popup.style.display = 'flex';
        popupImg.src = img.src;
      });
    });

    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
 
//Float Menu    
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }
  const backToTopBtn = document.getElementById("backToTopBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});