#!/usr/bin/env node
/**
 * Layer 10: Package Manager - Dependency management system
 * Dependencies: Layer 3 (Filesystem), Layer 5 (HTTP Client), Layer 6 (Database)
 */

class PackageManager {
  constructor() {
    this.registry = new Map();
    this.installed = new Map();
    this.lockfile = new Map();
  }

  // Register package
  register(name, version, dependencies = {}) {
    const key = `${name}@${version}`;
    this.registry.set(key, {
      name,
      version,
      dependencies,
      published: Date.now()
    });
    console.log(`[REGISTER] ${key}`);
  }

  // Parse version range
  parseVersion(range) {
    if (range.startsWith('^')) {
      return { type: 'caret', version: range.slice(1) };
    } else if (range.startsWith('~')) {
      return { type: 'tilde', version: range.slice(1) };
    } else {
      return { type: 'exact', version: range };
    }
  }

  // Compare versions
  compareVersions(a, b) {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
    
    if (aMajor !== bMajor) return aMajor - bMajor;
    if (aMinor !== bMinor) return aMinor - bMinor;
    return aPatch - bPatch;
  }

  // Find matching version
  findVersion(name, range) {
    const parsed = this.parseVersion(range);
    const packages = [];
    
    for (const [key, pkg] of this.registry) {
      if (pkg.name !== name) continue;
      
      if (parsed.type === 'exact' && pkg.version === parsed.version) {
        packages.push(pkg);
      } else if (parsed.type === 'caret') {
        const [major] = parsed.version.split('.');
        const [pkgMajor] = pkg.version.split('.');
        if (major === pkgMajor && this.compareVersions(pkg.version, parsed.version) >= 0) {
          packages.push(pkg);
        }
      } else if (parsed.type === 'tilde') {
        const [major, minor] = parsed.version.split('.');
        const [pkgMajor, pkgMinor] = pkg.version.split('.');
        if (major === pkgMajor && minor === pkgMinor && this.compareVersions(pkg.version, parsed.version) >= 0) {
          packages.push(pkg);
        }
      }
    }
    
    // Return latest matching version
    packages.sort((a, b) => this.compareVersions(b.version, a.version));
    return packages[0];
  }

  // Resolve dependencies
  resolve(name, version) {
    const resolved = new Map();
    const queue = [[name, version]];
    
    while (queue.length > 0) {
      const [pkgName, pkgVersion] = queue.shift();
      const key = `${pkgName}@${pkgVersion}`;
      
      if (resolved.has(pkgName)) continue;
      
      const pkg = this.findVersion(pkgName, pkgVersion);
      if (!pkg) {
        console.log(`[ERROR] Package ${pkgName}@${pkgVersion} not found`);
        continue;
      }
      
      resolved.set(pkgName, pkg);
      
      // Add dependencies to queue
      for (const [depName, depVersion] of Object.entries(pkg.dependencies)) {
        queue.push([depName, depVersion]);
      }
    }
    
    console.log(`[RESOLVE] ${name}@${version} -> ${resolved.size} packages`);
    return resolved;
  }

  // Install package
  install(name, version) {
    const resolved = this.resolve(name, version);
    
    for (const [pkgName, pkg] of resolved) {
      const key = `${pkgName}@${pkg.version}`;
      this.installed.set(pkgName, pkg);
      this.lockfile.set(pkgName, pkg.version);
      console.log(`[INSTALL] ${key}`);
    }
    
    return resolved.size;
  }

  // Uninstall package
  uninstall(name) {
    if (this.installed.has(name)) {
      this.installed.delete(name);
      this.lockfile.delete(name);
      console.log(`[UNINSTALL] ${name}`);
      return true;
    }
    return false;
  }

  // Update package
  update(name) {
    const current = this.installed.get(name);
    if (!current) return false;
    
    // Find latest version
    const packages = [];
    for (const [key, pkg] of this.registry) {
      if (pkg.name === name) packages.push(pkg);
    }
    
    packages.sort((a, b) => this.compareVersions(b.version, a.version));
    const latest = packages[0];
    
    if (latest && this.compareVersions(latest.version, current.version) > 0) {
      console.log(`[UPDATE] ${name} ${current.version} -> ${latest.version}`);
      this.installed.set(name, latest);
      this.lockfile.set(name, latest.version);
      return true;
    }
    
    return false;
  }

  // List installed
  list() {
    const packages = [];
    for (const [name, pkg] of this.installed) {
      packages.push({ name, version: pkg.version });
    }
    return packages;
  }

  // Get stats
  stats() {
    return {
      registry: this.registry.size,
      installed: this.installed.size,
      locked: this.lockfile.size
    };
  }
}

// Demo
if (require.main === module) {
  const pm = new PackageManager();
  
  console.log('=== Package Manager Demo ===\n');
  
  // Register packages
  pm.register('lodash', '4.17.21', {});
  pm.register('lodash', '4.17.20', {});
  pm.register('express', '4.18.0', { 'body-parser': '^1.20.0' });
  pm.register('body-parser', '1.20.0', {});
  pm.register('body-parser', '1.20.1', {});
  
  console.log();
  
  // Install with dependencies
  pm.install('express', '^4.18.0');
  
  console.log();
  
  // Install another package
  pm.install('lodash', '^4.17.0');
  
  console.log();
  
  // List installed
  console.log('Installed packages:', pm.list());
  
  console.log();
  
  // Update
  pm.update('body-parser');
  
  console.log('\nStats:', pm.stats());
}

module.exports = PackageManager;
