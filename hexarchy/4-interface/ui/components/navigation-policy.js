// Enforce dashboard-centric navigation for static HTML pages
(function(){
  var path = window.location.pathname;
  var isDashboard = /dashboard(\.html)?$/.test(path);

  if (isDashboard) {
    try { sessionStorage.setItem('visited_dashboard', 'true'); } catch (e) {}
  } else {
    var visited = null;
    try { visited = sessionStorage.getItem('visited_dashboard'); } catch (e) {}
    if (visited !== 'true') {
      // Force entry through dashboard
      window.location.href = (path.includes('/pages/') ? 'dashboard.html' : '/dashboard.html');
      return;
    }
  }

  // Provide a consistent Back to Dashboard control if header isn't present
  function ensureBackLink(){
    if (isDashboard) return;
    if (document.querySelector('[data-back-to-dashboard]')) return;
    var link = document.createElement('a');
    link.textContent = '← Back to Dashboard';
    link.href = path.includes('/pages/') ? 'dashboard.html' : '/dashboard.html';
    link.setAttribute('data-back-to-dashboard','true');
    link.style.cssText = 'position:fixed;top:10px;left:10px;z-index:10001;padding:8px 12px;background:#111;color:#0f0;border:1px solid rgba(0,255,0,0.3);border-radius:6px;text-decoration:none;font-weight:600;';
    document.body.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBackLink);
  } else {
    ensureBackLink();
  }
})();
