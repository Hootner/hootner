/**
 * Profile Page JavaScript
 * Handles dropdown closing on outside click
 */

document.addEventListener('click', (e) => {
  const notifDropdown = document.getElementById('notif-dropdown');
  if (!e.target.closest('[onclick*="toggleNotifications"]') && !e.target.closest('#notif-dropdown')) {
    if (notifDropdown) {
      notifDropdown.style.display = 'none';
    }
  }
  
  const moreMenu = document.getElementById('more-options-menu');
  if (moreMenu && !e.target.closest('[onclick*="toggleMoreOptions"]') && !e.target.closest('#more-options-menu')) {
    moreMenu.style.display = 'none';
  }
});
