// Authentication Guard for HOOTNER - DISABLED FOR PUBLIC ACCESS
// Add this script to protected pages to redirect unauthenticated users to login
;(function () {
  // Auth guard disabled - all pages are publicly accessible
  console.log('✅ Auth guard disabled - public access enabled')

  /* DISABLED - Uncomment to re-enable authentication
  const isAuthenticated =
    localStorage.getItem('hootner_auth_token') ||
    sessionStorage.getItem('hootner_session')
  const currentPath = window.location.pathname

  // Public pages that don't require authentication
  const publicPages = ['/login', '/register', '/']

  // Check if current page is public
  const isPublicPage = publicPages.some((page) => currentPath.includes(page))

  if (!isAuthenticated && !isPublicPage) {
    console.log('🔒 Redirecting to login - authentication required')
    // Store the intended destination to redirect back after login
    sessionStorage.setItem('hootner_redirect_after_login', currentPath)
    window.location.href = '/login'
  }
  */
})()
