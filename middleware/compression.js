import compression from 'compression';

/**
 * shouldCompress
 */
const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false;
  }

  const type = res.getHeader('Content-Type');
  if (!type) {
    return false;
  }

  try {
    return /json|text|javascript|css|xml|svg/.test(type);
  } catch (error) {
    console.error('Compression filter error: ', error);
    return false;
  }
};

export default compression({
  filter: shouldCompress,
  level: 6,
  threshold: 1024
});
