function toggleMobileMenu() {
  const menu = document.getElementById('nav-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('nav-menu');
  const btn = document.querySelector('.mobile-menu-btn');
  if (menu && !menu.contains(e.target) && !btn?.contains(e.target)) {
    menu.classList.remove('active');
  }
});
