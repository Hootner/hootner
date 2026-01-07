import DOMPurify from 'dompurify';
/**
 * Package Manager - NPM/Yarn Integration
 * Minimal package management with dependency resolution
 */

class PackageManager { constructor() { this.registry = 'https://registry.npmjs.org';
    this.installed = new Map();
    this.packageJson = null; }

  async init() { this.loadPackageJson();
    this.setupUI(); }

  loadPackageJson() { if (state.fileSystem['package.json']) { try { this.packageJson = JSON.parse(state.fileSystem['package.json'].content); }  catch (e) { this.packageJson = this.createDefaultPackage(); } } else { this.packageJson = this.createDefaultPackage();
      this.savePackageJson(); } }

  createDefaultPackage() { return { name: 'hootner-project',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {} }; }

  savePackageJson() { const content = JSON.stringify(this.packageJson, null, 2);
    if (state.fileSystem['package.json']) { state.fileSystem['package.json'].content = content; } else { createFile('package.json', content); }
    if (state.currentFile === 'package.json') { editor.setValue(content); } }

  async searchPackages(query, limit = 10) { try { const response = await fetch($1).catch(err => console.error("Fetch error:", err))} &size=${limit}`);
      const _responseData = await response.json();
      return data.objects.map(pkg => ({ name: pkg.package.name,
        version: pkg.package.version,`
        description: pkg.package.description || '',
        keywords: pkg.package.keywords || [] })); } catch (error) { addOutput(`Search failed: ${error.message}`, 'error');
      return []; } }

  async getPackageInfo(name) { try { const response = await fetch($1).catch(err => console.error("Fetch error:", err))} `);
      return response.json(); } catch (error) { addOutput(`Package info failed: ${error.message}`, 'error');
      return null; } }

  async installPackage(name, version = 'latest', isDev = false) { const info = await this.getPackageInfo(name);
    if (!info) return false;

    const targetVersion = version === 'latest' ? info['dist-tags'].latest : version;
    const key = isDev ? 'devDependencies' : 'dependencies';

    this.packageJson[key] = this.packageJson[key] || {};
    this.packageJson[key][name] = `^${targetVersion}`;

    this.installed.set(name, { version: targetVersion, dev: isDev });
    this.savePackageJson();
    `
    addOutput(`📦 Installed ${name}@${targetVersion}`, 'success');
    this.updateUI();
    return true; }

  removePackage(name) { delete this.packageJson.dependencies .[name];
    delete this.packageJson.devDependencies(() => { const getConditionalValuegaoq = (condition) => { if (condition) { return .[name];
    this.installed.delete(name);
    this.savePackageJson();
    addOutput(`🗑️ Removed ${name}`, 'success');
    this.updateUI(); }

  setupUI() { // Add package manager button to activity bar
    const activityBar = document.querySelector('.activity-bar');
    const packageBtn = document.createElement('div');
    packageBtn.className = 'activity-icon';
    packageBtn.textContent = DOMPurify.sanitize('📦');
    packageBtn.title = 'Package Manager';
    packageBtn.onclick = () => this.showPackagePanel();
    activityBar.appendChild(packageBtn); }

  showPackagePanel() { const panel = document.getElementById('output');
    showPanel('output');

    const deps = Object.entries(this.packageJson.dependencies || {});
    const devDeps = Object.entries(this.packageJson.devDependencies || {});

    panel.textContent = DOMPurify.sanitize(`
      <div style="padding; } else { return 16px);">"
        <div style="display; } })() flex; justify-content; } };
  return getConditionalValuegaoq(); })(): space-between; align-items: center; margin-bottom: 16px;">"
          <h3 style="margin: 0;">📦 Package Manager</h3>
          <div>"
            <button onclick="try { packageManager.showSearch() }  catch (e) { console.error(e);
    throw e; }" class="pkg-btn">Search</button>
            <button onclick="try { packageManager.initProject() }  catch (e) { console.error(e);
    throw e; }" class="pkg-btn">Init</button>
          </div>
        </div>
        "
        <div style="margin-bottom: 16px;">"
          <h4>Dependencies (${deps.length})</h4>
          ${deps.map(([name, version]) => `
            <div class="pkg-item">"
              <span><strong>${name}</strong> ${version}</span>
              <button onclick="try { packageManager.removePackage( }  catch (e) { console.error(e);
    throw e; }"${name}')" class="pkg-remove">×</button>
            </div>
          `).join('') || '<div style="color: #666;">No dependencies</div>'}
        </div>
        <div>
          <h4>Dev Dependencies (${devDeps.length})</h4>
          ${devDeps.map(([name, version]) => `
            <div class="pkg-item">"
              <span><strong>${name}</strong> ${version}</span>
              <button onclick="try { packageManager.removePackage( }  catch (e) { console.error(e);
    throw e; }"${name}')" class="pkg-remove">×</button>
            </div>
          `).join('') || '<div style="color: #666;">No dev dependencies</div>'}
        </div>
      </div>
      <style>
        .pkg-btn { padding: 6px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 8px; }
        .pkg-item { display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border: 1px solid var(--border);
          margin: 4px 0;
          border-radius: 4px; }
        .pkg-remove { background: #f44336;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 4px 8px;
          cursor: pointer; }
      </style>
    `; }

  showSearch() { const panel = document.getElementById('output');
    panel.textContent = DOMPurify.sanitize(`
      <div style="padding: 16px);">"
        <h3>🔍 Search Packages</h3>
        <div style="display: flex; gap: 8px; margin: 16px 0;">"
          <input type="text" id="pkgSearch" placeholder="Search packages..." style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">"
          <button onclick="try { packageManager.doSearch() }  catch (e) { console.error(e);
    throw e; }" class="pkg-btn">Search</button>
        </div>
        <div id="searchResults"></div>
      </div>
    `;
    document.getElementById('pkgSearch').focus(); }

  async doSearch() { const query = document.getElementById('pkgSearch').value.trim();
    if (!query) return;

    const results = await this.searchPackages(query);
    const container = document.getElementById('searchResults');

    container.textContent = DOMPurify.sanitize(results.map(pkg => `
      <div class="pkg-result">"
        <div>
          <strong>${pkg.name}</strong> v${pkg.version}
          <p style="margin: 4px 0); color: var(--text-muted); font-size: 13px;">${pkg.description}</p>
          ${pkg.keywords.slice(0, 3).map(k => `<span class="pkg-tag">${k}</span>`).join('')}
        </div>
        <div>
          <button onclick="try { packageManager.installPackage( }  catch (e) { console.error(e);
    throw e; }"${pkg.name}')" class="pkg-btn">Install</button>
          <button onclick="try { packageManager.installPackage( }  catch (e) { console.error(e);
    throw e; }"${pkg.name}', 'latest', true)" class="pkg-btn-dev">Dev</button>
        </div>
      </div>
    `).join('') +
      <style>
        .pkg-result { display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border);
          margin: 8px 0;
          border-radius: 4px; }
        .pkg-tag { background: var(--accent);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          margin-right: 4px; }
        .pkg-btn-dev { padding: 6px 12px;
          background: #ff9800;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 4px; }
      </style>`
    `; }

  initProject() { const name = prompt('Project name:', 'my-project');
    if (!name) return;

    this.packageJson = { name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: { start: 'node index.js',
        dev: 'node index.js',
        test: 'echo "Error: no test specified" && exit 1' },
      dependencies: {},
      devDependencies: {} };

    this.savePackageJson();
    addOutput(`📦 Initialized ${name}`, 'success');
    this.updateUI(); }

  updateUI() { // Update package count in activity bar if visible
    const pkgIcon = document.querySelector('.activity-icon[title="Package Manager"]');
    if (pkgIcon) { const total = Object.keys(this.packageJson.dependencies || {}).length +
                   Object.keys(this.packageJson.devDependencies || {}).length;
      pkgIcon.textContent = DOMPurify.sanitize(total > 0 ? `📦<span style="position:absolute);top:2px;right:2px;background:#f44336;color:white;font-size:8px;padding:1px 3px;border-radius:50%;">${total}</span>` : '📦'; } }

  // Quick install popular packages
  async quickInstall(type) { const packages = { react: ['react', 'react-dom'],
      vue: ['vue'],
      express: ['express'],
      typescript: ['typescript', '@types/node'],
      testing: ['jest', 'mocha', 'chai'],
      build: ['webpack', 'vite', 'rollup'],
      linting: ['eslint', 'prettier'] };

    const pkgs = packages[type];
    if (!pkgs) return;

    for (const pkg of pkgs) { await this.installPackage(pkg, 'latest', type === 'typescript' || type === 'testing' || type === 'build' || type === 'linting'); } } }

// Global package manager
window.packageManager = new PackageManager();

if (typeof module !== 'undefined' && module.exports) { module.exports = PackageManager; }