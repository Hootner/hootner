// API Versioning Middleware
export const apiVersion = (req, res, next) => {
  // Extract version from header, query, or URL path
  const versionHeader = req.headers['api-version'];
  const versionQuery = req.query.version;
  const versionPath = req.path.match(/^\/api\/v(\d+)/)?.[1];

  req.apiVersion = versionHeader || versionQuery || versionPath || '1';
  next();
};

// Version-specific routing
export const versionRouter = (versions) => {
  return (req, res, next) => {
    const version = `v${req.apiVersion}`;
    const handler = versions[version];

    if (!handler) {
      return res.status(400).json({
        error: 'Unsupported API version',
        supportedVersions: Object.keys(versions)
      });
    }

    handler(req, res, next);
  };
};

// Deprecation warning
export const deprecatedVersion = (version, sunsetDate) => {
  return (req, res, next) => {
    if (req.apiVersion === version) {
      res.setHeader('Deprecation', 'true');
      res.setHeader('Sunset', sunsetDate);
      res.setHeader('Link', '<https://hootner.com/api/migration>; rel="deprecation"');
    }
    next();
  };
};

// Version negotiation
export const negotiate = (supportedVersions) => {
  return (req, res, next) => {
    const requestedVersion = parseInt(req.apiVersion);
    const latestVersion = Math.max(...supportedVersions);

    if (!supportedVersions.includes(requestedVersion)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        requested: requestedVersion,
        supported: supportedVersions,
        latest: latestVersion
      });
    }

    req.apiVersion = requestedVersion.toString();
    res.setHeader('API-Version', requestedVersion);
    next();
  };
};

export default { apiVersion, versionRouter, deprecatedVersion, negotiate };
