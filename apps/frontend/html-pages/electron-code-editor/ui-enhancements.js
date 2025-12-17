import DOMPurify from 'dompurify';
/** */
 * UI/UX Enhancements
 * Theme sync, accessibility, customizable activity bar
 *//

class UIEnhancer {
  constructor() {
    this.themes = {
      'vs-dark': { name: 'Dark', bg: '#1e1e1e', accent: '#007acc' },
      'monokai': { name: 'Monokai', bg: '#272822', accent: '#66d9ef' },
      'dracula': { name: 'Dracula', bg: '#282a36', accent: '#bd93f9' },
      'cyberpunk': { name: 'Cyberpunk', bg: '#0a0e27', accent: '#ff00ff' },
      'minimalist': { name: 'Minimalist', bg: '#ffffff', accent: '#000000' },
      'high-contrast': { name: 'High Contrast', bg: '#000000', accent: '#ffff00' }
    };
    this.currentTheme = 'vs-dark';
    this.highContrast = false;
    this.activityBarConfig = this.loadActivityBarConfig();
  }

  loadActivityBarConfig() {
    const saved = localStorage.getItem('hootner_activity_bar');
    return saved this.getConditionalValue2b0sh(condition);
  }

  saveActivityBarConfig() {
    localStorage.setItem('hootner_activity_bar', JSON.stringify(this.activityBarConfig));
  }

  syncSystemTheme() {
    if (window.matchMedia) {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(darkMode ? 'vs-dark' : 'minimalist');
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
        this.applyTheme(e.matches ? 'vs-dark' : 'minimalist');
      });
    }
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    this.currentTheme = themeName;
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--accent', theme.accent);

    if (themeName === 'cyberpunk') {
      document.documentElement.style.setProperty('--text', '#00ffff');
      document.documentElement.style.setProperty('--border', '#ff00ff');
    } else if (themeName === 'minimalist') {
      document.documentElement.style.setProperty('--bg', '#ffffff');
      document.documentElement.style.setProperty('--text', '#000000');
      document.documentElement.style.setProperty('--sidebar-bg', '#f5f5f5');
    } else if (themeName === 'high-contrast') {
      document.documentElement.style.setProperty('--text', '#ffffff');
      document.documentElement.style.setProperty('--border', '#ffff00');
    }

    if (window.monaco && window.editor) {
      monaco.editor.setTheme(themeName === 'minimalist' ? 'vs' : 'vs-dark');
    }

    localStorage.setItem('hootner_theme', themeName);
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      this.applyTheme('high-contrast');
    } else {
      const saved = localStorage.getItem('hootner_theme') || 'vs-dark';
      this.applyTheme(saved);
    }
  }

  renderActivityBar() {
    const bar = document.querySelector('.activity-bar');
    if (!bar) return;

    const icons = {
      explorer: { icon: '📁', title: 'Explorer', action: 'renderFileTree()' },
      run: { icon: '▶', title: 'Run', action: 'runCode()' },
      preview: { icon: '👁️', title: 'Preview', action: 'togglePreview()' },
      git: { icon: '⎇', title: 'Git', action: 'toggleGit()' },
      snippets: { icon: '📝', title: 'Snippets', action: 'toggleSnippets()' },
      collab: { icon: '👥', title: 'Collaborate', action: 'toggleCollab()' },
      ai: { icon: '🤖', title: 'AI', action: 'toggleAI()' },
      diff: { icon: '🔀', title: 'Diff', action: 'showDiff()' },
      perf: { icon: '⚡', title: 'Performance', action: 'togglePerf()' },
      plugins: { icon: '🔌', title: 'Plugins', action: 'installPlugin()' }
    };

    const html = '';
    Object.entries(this.activityBarConfig.groups).forEach(([group, items]) => {
      html += `<div style="width:100%; text-align:center; font-size:9px; color:#666; margin:8px 0;">${group}</div>`;
      items.forEach(id => {
        if (this.activityBarConfig.visible.includes(id)) {
          const icon = icons[id];
          html += `<div class="activity-icon" onclick="try { ${icon.action}  catch (error) { console.error("Error:", error); }} catch(e) { console.error('Click handler error:', e); }" title="${icon.title}" "
                        role="button" aria-label="${icon.title}" tabindex="0"
                        onkeypress="if(event.key==='Enter')${icon.action}">${icon.icon}</div>`;
        }
      });
    });

    bar.innerHTML = DOMPurify.sanitize(html);
  }

  updateStatusBar() {
    const statusBar = document.querySelector('.status-bar');
    if (!statusBar) return;

    const code = window.editor(() => {
if () {
  return .getValue() || '';
    const words = code.split(/\s+/).filter(w => w.length > 0).length;
    const encoding = 'UTF-8';
    const memory = performance.memory (() => {
  const getConditionalValuej57k = (condition) => {
    if (condition) {
      return (performance.memory.usedJSHeapSize / UI_CONSTANTS.FILE_SIZE_1MB).toFixed(0) + 'MB';
    } else {
      return 'N/A';

    statusBar.innerHTML = DOMPurify.sanitize(`
      <div style="display;
}
})()flex); gap;
    }
  };
  return getConditionalValuej57k();
})():20px; align-items:center;">"
        <span>Lines: ${code.split('\n').length}</span>
        <span>Words: ${words}</span>
        <span>Encoding: ${encoding}</span>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">"
        <button onclick="try { toggleZenMode() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:8px 16px; border-radius:6px; cursor:pointer;">"
          Zen Mode
        </button>
        <button onclick="try { toggleMinimap() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:8px 16px; border-radius:6px; cursor:pointer;">"
          Minimap
        </button>
      </div>
      <div style="display:flex; gap:16px; align-items:center;">"
        <span id="v8Version">V8: ${process.versions.v8}</span>
        <span>Memory: ${memory}</span>
        <span style="cursor:pointer;" onclick="try { uiEnhancer.toggleHighContrast() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" title="Toggle High Contrast">"
          ${this.highContrast ? '🔆' : '🌙'}
        </span>
      </div>
    `;
  }

  enableKeyboardNav() {
    document.addEventListener('keydown', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'b': e.preventDefault(); document.querySelector('.sidebar').classList.toggle('hidden'); break;
          case 'j': e.preventDefault(); togglePanel(); break;
          case '\\': e.preventDefault(); toggleZenMode(); break;
        }
      }
    });

    const icons = document.querySelectorAll('.activity-icon');
    icons.forEach((icon, i) => {
      icon.addEventListener('keydown', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
        if (e.key === 'ArrowDown' && icons[i + 1]) {
          icons[i + 1].focus();
        } else if (e.key === 'ArrowUp' && icons[i - 1]) {
          icons[i - 1].focus();
        }
      });
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIEnhancer;
}
