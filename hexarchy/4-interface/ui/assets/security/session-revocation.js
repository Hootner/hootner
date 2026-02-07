/**
 * CENTRALIZED SESSION REVOCATION SYSTEM
 *
 * This script automatically kicks out users whose sessions were created
 * before the admin set a revocation timestamp via the admin panel.
 *
 * Include this script at the TOP of every protected page:
 * <script src="../assets/security/session-revocation.js"></script>
 */

(function() {
  'use strict';

  const SESSION_REVOCATION_KEY = 'hootner_session_revocation';
  const CHECK_INTERVAL = 5000; // Check every 5 seconds

  function validateSessionRevocation() {
    const revocationKey = localStorage.getItem(SESSION_REVOCATION_KEY);
    const authToken = localStorage.getItem('hootner_auth_token');

    // If no revocation key set, all sessions are valid
    if (!revocationKey) {
      return true;
    }

    // If no auth token, user not logged in (OK)
    if (!authToken) {
      return true;
    }

    try {
      // Auth token format: base64(username:timestamp)
      const decoded = atob(authToken);
      const parts = decoded.split(':');

      if (parts.length >= 2) {
        const sessionTimestamp = parseInt(parts[1]);
        const revocationTime = parseInt(revocationKey);

        // If session was created BEFORE the revocation key timestamp, kick them out
        if (!isNaN(sessionTimestamp) && !isNaN(revocationTime) && sessionTimestamp < revocationTime) {
          console.warn('🚪 Session revoked by admin - forcing logout');

          // Clear all session data
          localStorage.removeItem('hootner_auth_token');
          localStorage.removeItem('hootner_user');
          localStorage.removeItem('hootner_session_token');
          localStorage.removeItem('hootner_fingerprint');
          sessionStorage.clear();

          // Show alert and redirect
          alert('⚠️ Your session has been terminated by an administrator.\n\nPlease log in again to continue.');

          // Redirect to login page
          const loginPage = window.location.pathname.includes('video-player')
            ? 'login.html'
            : '/hexarchy/4-interface/ui/pages/login.html';
          window.location.href = loginPage;

          return false;
        }
      }
    } catch (e) {
      // Invalid token format - could be corrupted
      console.error('Session validation error:', e);
      // Don't kick out on error, just log it
    }

    return true;
  }

  // Run validation immediately on script load
  if (!validateSessionRevocation()) {
    // Session invalid, user will be redirected
    return;
  }

  // Set up periodic validation check (every 5 seconds)
  setInterval(validateSessionRevocation, CHECK_INTERVAL);

  // Also check when tab becomes visible again (catches admin actions in other tabs)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      validateSessionRevocation();
    }
  });

  // Log that system is active
  console.log('🔒 Session revocation system active (checking every 5s)');

})();
