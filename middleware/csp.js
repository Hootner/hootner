/** */
 * cspMiddleware middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _cspMiddleware = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'","
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'","
      "img-src 'self' data: https:","
      "font-src 'self' data:","
      "connect-src 'self' https://api.stripe.com",
      'frame-src https://js.stripe.com',
      "object-src 'none'","
      "base-uri 'self'","
      "form-action 'self'","
      "frame-ancestors 'none'","
      'upgrade-insecure-requests',
    ].join('; ')
  );
  next();
};
