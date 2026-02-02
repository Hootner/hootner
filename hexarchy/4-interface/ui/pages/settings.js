/**
 * Settings Page JavaScript
 * Handles tab navigation and form validation
 */

function showTab(tab) {
  document
    .querySelectorAll('.nav-item')
    .forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  document
    .querySelectorAll('[id$="-tab"]')
    .forEach(el => el.classList.add('hidden'));
  document.getElementById(tab + '-tab').classList.remove('hidden');
}

function saveProfile() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const error = document.getElementById('error');

  error.classList.add('hidden');

  if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    error.textContent = 'Invalid username format';
    error.classList.remove('hidden');
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.textContent = 'Invalid email format';
    error.classList.remove('hidden');
    return;
  }

  alert('Settings saved!');
}

function sendResetLink() {
  const email = document.getElementById('reset-email').value;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('reset-success').classList.remove('hidden');
    document.getElementById('reset-email').value = '';
  }
}
