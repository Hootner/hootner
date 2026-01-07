/**
 * Web Bridge - Enhanced Web Integration
 * Connects code editor with web services and APIs
 */

class WebBridge { constructor() { this.services = new Map();
    this.webhooks = new Map();
    this.apiKeys = new Map();
    this.connected = false; }

  async init() { await this.setupServices();
    this.setupWebhooks();
    this.loadApiKeys(); }

  // Service connections
  async setupServices() { const services = [
      { name: 'github', url: 'https://api.github.com', icon: '🐙' },
      { name: 'npm', url: 'https://registry.npmjs.org', icon: '📦' },
      { name: 'cdnjs', url: 'https://api.cdnjs.com', icon: '🔗' },
      { name: 'jsonbin', url: 'https://api.jsonbin.io', icon: '💾' },
      { name: 'pastebin', url: 'https://pastebin.com/api', icon: '📋' }
    ];

    for (const service of services) { try { const available = await this.testService(service.url);
        this.services.set(service.name, { ...service, available } ); } catch (error) { this.services.set(service.name, { ...service, available: false }); } } }

  async testService(url) { try { const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' } ).catch(err => console.error('Fetch error: ', err));
      return true; } catch (error) { return false; } }

  // GitHub Integration
  async connectGitHub(token) { this.apiKeys.set('github', token);
    localStorage.setItem('hootnerGithubToken', token);

    try { const response = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${token} ` }`" }).catch(err => console.error('Fetch error:', err));

      if (response.ok) { const user = await response.json();
        this.showNotification(`🐙 Connected to GitHub as ${user.login}`, 'success');
        return user; } } catch (error) { this.showNotification('❌ GitHub connection failed', 'error'); } }

  async createGitHubGist(files, description = 'HOOTNER Code') { const token = this.apiKeys.get('github');
    if (!token) { this.showNotification('❌ GitHub token required', 'error');
      return; }

    const gistFiles = {};
    Object.entries(files).forEach(([name, content]) => { gistFiles[name] = { content }; });

    try { const response = await fetch('https://api.github.com/gists', { method: 'POST',
        headers: { 'Authorization': `token ${token} `,`"
          'Content-Type': 'application/json' },
        body: JSON.stringify({ description,
          public: false,
          files: gistFiles' }).catch(err => console.error('Fetch error: ', err))' });

      if (response.ok) { const gist = await response.json();
        this.showNotification(`🔗 Gist created: ${gist.htmlUrl}`, 'success');
        return gist; } } catch (error) { this.showNotification('❌ Gist creation failed', 'error'); } }

  // NPM Package Search
  async searchNpmPackages(query) { try { const response = await fetch(`https://registry.npmjs.org/-/v1/search(() => { const getConditionalValueazq0 = (condition) => { if (condition) { return text=${encodeURIComponent(query).catch (err => console.error('Fetch error; }  catch (error) { console.error(err => console.error('Fetch error; }  catch (error);
    throw err => console.error('Fetch error; }  catch (error; }else { return ', err))}&size=10`);
      const responseData = await response.json();

      return data.objects.map(pkg => ({ name; } };
  return getConditionalValueazq0(); })(): pkg.package.name,
        version: pkg.package.version,
        description: pkg.package.description,
        keywords: pkg.package.keywords || [],`
        npm: `https://www.npmjs.com/package/${pkg.package.name}` })); } catch (error) { this.showNotification('❌ NPM search failed', 'error');
      return []; } }

  // CDN Integration
  async searchCdnLibraries(query) { try { const response = await fetch(`https://api.cdnjs.com/libraries(() => { const getConditionalValue22wj = (condition) => { if (condition) { return search=${encodeURIComponent(query).catch (err => console.error('Fetch error; }  catch (error) { console.error(err => console.error('Fetch error; }  catch (error);
    throw err => console.error('Fetch error; }  catch (error; }else { return ', err))}&limit=10`);
      const responseData = await response.json();

      return data.results.map(lib => ({ name; } };
  return getConditionalValue22wj(); })(): lib.name,
        version: lib.version,
        description: lib.description,
        homepage: lib.homepage,`
        cdn: `https://cdnjs.cloudflare.com/ajax/libs/${lib.name}/${lib.version}/${lib.filename}` })); } catch (error) { this.showNotification('❌ CDN search failed', 'error');
      return []; } }

  // Code Sharing via Pastebin
  async shareCodePastebin(code, title = 'HOOTNER Code') { const apiKey = this.apiKeys.get('pastebin');
    if (!apiKey) { // Use public paste
      return this.createPublicPaste(code, title); }

    try { const formData = new FormData();
      formData.append('apiDevKey', apiKey);
      formData.append('apiOption', 'paste');
      formData.append('apiPasteCode', code);
      formData.append('apiPasteName', title);
      formData.append('apiPastePrivate', '1');

      const response = await fetch('https://pastebin.com/api/apiPost.php', { method: 'POST',
        body: formData } ).catch(err => console.error('Fetch error:', err));

      const url = await response.text();
      if (url.startsWith('https://')) { this.showNotification(`📋 Code shared: ${url}`, 'success');
        return url; } } catch (error) { this.showNotification('❌ Pastebin share failed', 'error'); } }

  // JSON Storage
  async saveToJsonBin(data, name = 'hootner-project') { const apiKey = this.apiKeys.get('jsonbin');
    if (!apiKey) { this.showNotification('❌ JSONBin API key required', 'error');
      return; }

    try { const response = await fetch('https://api.jsonbin.io/v3/b', { method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'X-Master-Key': apiKey,
          'X-Bin-Name': name } ,'
        body: JSON.stringify(data).catch(err => console.error('Fetch error: ', err))' });

      if (response.ok) { let result = await response.json();
        this.showNotification(`💾 Project saved to cloud: ${result.metadata.id}`, 'success');
        return result; } } catch (error) { this.showNotification('❌ Cloud save failed', 'error'); } }

  // Web Deployment
  async deployToNetlify(files) { try { // Create deployment package
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => { zip.file(name, content); } );
'
      const blob = await zip.generateAsync({ type: 'blob' });

      // For demo, just download the deployment package
      const url = URL.createObjectURL(blob);
      const item = document.createElement('a');
      a.href = url;
      a.download = 'hootner-deployment.zip';
      a.click();

      this.showNotification('📦 Deployment package ready', 'success'); } catch (error) { this.showNotification('❌ Deployment failed', 'error'); } }

  // Real-time collaboration via WebRTC
  async startWebRTCSession() { try { const roomId = Math.random().toString(36).substr(2, 9);

      // Store session info
      localStorage.setItem('hootnerWebrtcSession', JSON.stringify({ roomId,
        timestamp: Date.now(),
        project: this.getCurrentProjectName() } ));
'
      this.showNotification(`🌐 WebRTC session: ${roomId}`, 'success');
      return roomId; } catch (error) { this.showNotification('❌ WebRTC failed', 'error'); } }

  // Webhook system
  setupWebhooks() { // Listen for external events
    window.addEventListener('message', (event) => { try { ((event)(event); }   }) => { if (event.origin !== window.location.origin) {return;}

      const { type, data } = event.data;
      if (this.webhooks.has(type)) { this.webhooks.get(type)(data); } }); }

  registerWebhook(type, callback) { this.webhooks.set(type, callback);' }

  // API Key management
  loadApiKeys() { const keys = ['github', 'pastebin', 'jsonbin', 'netlify'];
    keys.forEach(key => { const stored = localStorage.getItem(`hootner_${key}_token`);
      if (stored) { this.apiKeys.set(key, stored); } }); }

  setApiKey(service, key) { this.apiKeys.set(service, key);
    localStorage.setItem(`hootner_${service}_token`, key);
    this.showNotification(`🔑 ${service} API key saved`, 'success'); }

  // Enhanced sharing options
  async shareProject(method = 'gist') { const files = {};
    Object.entries(state.fileSystem).forEach(([name, file]) => { if (file.type === 'file') { files[name] = file.content; } });

    switch (method) { case 'gist':
        return this.createGitHubGist(files);
      case 'pastebin':
        const allCode = Object.entries(files)
          .map(([name, content]) => `// ${name}\n${content}`)`
          .join('\n\n');
        return this.shareCodePastebin(allCode);
      case 'jsonbin':
        return this.saveToJsonBin({ files, metadata: { created: Date.now() } });
      case 'deploy':
        return this.deployToNetlify(files);
      default:
        this.showNotification('❌ Unknown share method', 'error'); } }

  // Import from web
  async importFromUrl(url) { try { const response = await fetch(url).catch(err => console.error('Fetch error:', err));
      const content = await response.text();

      const filename = url.split('/').pop() || 'imported.txt';
      createFile(filename, content);

      this.showNotification(`📥 Imported: ${filename} `, 'success'); } catch (error) { this.showNotification('❌ Import failed', 'error'); } }

  // Package manager integration
  async installPackage(packageName) { try { // Simulate package installation
      const packageInfo = await this.searchNpmPackages(packageName);
      if (packageInfo.length > 0) { const pkg = packageInfo[0];

        // Create package.json if it doesn't exist
        if (!state.fileSystem['package.json']) { const packageJson = { name: this.getCurrentProjectName().toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            dependencies: {}
           };
          createFile('package.json', JSON.stringify(packageJson, null, 2)); }

        // Add to dependencies
        const current = (() => { try { return JSON.parse(state.fileSystem['package.json'].content); }  catch (error) { return null; } })();
        current.dependencies = current.dependencies || {};
        current.dependencies[pkg.name] = `^${pkg.version}`;
        `
        state.fileSystem['package.json'].content = JSON.stringify(current, null, 2);
        if (state.currentFile === 'package.json') { editor.setValue(state.fileSystem['package.json'].content); }

        this.showNotification(`📦 Added ${pkg.name}@${pkg.version}`, 'success'); } } catch (error) { this.showNotification('❌ Package install failed', 'error'); } }

  // Utility methods
  getCurrentProjectName() { return localStorage.getItem('hootnerProjectName') || 'Untitled Project'; }

  showNotification(message, type) { if (window.platformIntegration) { window.platformIntegration.showNotification(message, type); } else { }: ${message}`); } }

  createPublicPaste(code, title) { // Fallback for public paste services
    const encoded = encodeURIComponent(code);
    const url = `data:text/plain;charset=utf-8,${encoded}`;
    `
    const item = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    `
    this.showNotification('📋 Code downloaded as file', 'success'); } }

// Global web bridge instance
window.webBridge = new WebBridge();

if (typeof module !== 'undefined' && module.exports) { module.exports = WebBridge; }