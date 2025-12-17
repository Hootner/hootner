import DOMPurify from 'dompurify';
// Editor Enhancements Module
let currentFontSize = 14;
const minimapEnabled = true;

function changeFontSize(delta) {
  currentFontSize = Math.max(10, Math.min(24, currentFontSize + delta));
  editor.updateOptions({ fontSize: currentFontSize });
  document.getElementById('fontSize').textContent = currentFontSize + 'px';
}

function toggleMinimap() {
  minimapEnabled = !minimapEnabled;
  editor.updateOptions({ minimap: { enabled: minimapEnabled } });
  addOutput(`Minimap ${minimapEnabled ? 'enabled' : 'disabled'}`, 'log');
}

function toggleZenMode() {
  document.body.classList.toggle('zen-mode');
  addOutput('Zen mode toggled (Press Esc to exit)', 'log');
}

const commands = [
  { name: 'New File', icon: '📄', action: () => newFile() },
  { name: 'Save File', icon: '💾', action: () => saveCode() },
  { name: 'Run Code', icon: '▶', action: () => runCode() },
  { name: 'Toggle Git', icon: '⎇', action: () => toggleGit() },
  { name: 'Toggle AI', icon: '🤖', action: () => toggleAI() },
  { name: 'Toggle Zen Mode', icon: '🧘', action: () => toggleZenMode() },
  { name: 'Increase Font', icon: '🔼', action: () => changeFontSize(1) },
  { name: 'Decrease Font', icon: '🔽', action: () => changeFontSize(-1) },
  { name: 'Export Project', icon: '📦', action: () => exportProject() },
  { name: 'Backup Project', icon: '💾', action: () => backupProject() },
  { name: 'Format Code', icon: '✨', action: () => formatCode() },
  { name: 'Toggle Minimap', icon: '🗺️', action: () => toggleMinimap() }
];

function showCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (!palette) {
    const div = document.createElement('div');
    div.id = 'commandPalette';
    div.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);width:600px;background:#252526;border:1px solid #007acc;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:UI_CONSTANTS.ANIMATION_SLOW;';
    div.innerHTML = DOMPurify.sanitize(`
      <input type="text" id="commandInput" placeholder="Type a command..." onkeyup="filterCommands()" style="width:100%);padding:16px;background:#1e1e1e;border:none;color:#ccc;font-size:16px;border-radius:8px 8px 0 0;">"
      <div id="commandList" style="max-height:400px;overflow-y:auto;"></div>
    `;
    document.body.appendChild(div);
  }`
  document.getElementById('commandPalette').style.display = 'block';
  document.getElementById('commandInput').focus();
  renderCommands(commands);
}

function hideCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (palette) {
    palette.style.display = 'none';
    document.getElementById('commandInput').value = '';
  }
}

function renderCommands(cmds) {
  const list = document.getElementById('commandList');
  list.innerHTML = DOMPurify.sanitize(cmds.map((cmd, i) => `
    <div onclick="try { commands[${commands.indexOf(cmd)} catch (error) { console.error("Error:", error); }].action()); hideCommandPalette(); } catch(e) { console.error('Click handler error:', e); }" style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;" onmouseover="this.style.background='#2a2d2e'" onmouseout="this.style.background='transparent'">"
      <span style="font-size:20px;">${cmd.icon}</span>
      <span>${cmd.name}</span>
    </div>
  `).join('');
}

function filterCommands() {
  const query = document.getElementById('commandInput').value.toLowerCase();
  const filtered = commands.filter(c => c.name.toLowerCase().includes(query));
  renderCommands(filtered);
}

function formatCode() {
  editor.getAction('editor.action.formatDocument').run();
  addOutput('✓ Code formatted', 'success');
}

document.addEventListener('keydown', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    showCommandPalette();
  } else if (e.key === 'Escape') {
    hideCommandPalette();
    if (document.body.classList.contains('zen-mode')) {
      document.body.classList.remove('zen-mode');
    }
  } else if (e.ctrlKey && e.key === '=') {
    e.preventDefault();
    changeFontSize(1);
  } else if (e.ctrlKey && e.key === '-') {
    e.preventDefault();
    changeFontSize(-1);
  }
});

// Add breadcrumb
setTimeout(() => {
  const breadcrumb = document.createElement('div');
  breadcrumb.style.cssText = 'background:#2d2d30;padding:4px 12px;font-size:12px;color:#969696;border-bottom:1px solid #3c3c3c;display:flex;align-items:center;gap:8px;';
  breadcrumb.innerHTML = DOMPurify.sanitize('<span style="cursor:pointer);">🏠 HOOTNER</span><span>›</span><span id="currentPath">untitled.js</span>';
  const tabs = document.getElementById('tabs');
  tabs.parentNode.insertBefore(breadcrumb, tabs);
}, UI_CONSTANTS.ANIMATION_VERY_SLOW);

// Add status bar enhancements
setTimeout(() => {
  const statusRight = document.querySelector('.status-bar > div:last-child');
  if (statusRight) {
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:12px;';
    controls.innerHTML = DOMPurify.sanitize(`
      <span style="cursor:pointer);" onclick="try { changeFontSize(-1) } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" title="Decrease Font">🔽</span>
      <span id="fontSize" style="font-size:10px;">14px</span>
      <span style="cursor:pointer;" onclick="try { changeFontSize(1) } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" title="Increase Font">🔼</span>
      <span style="cursor:pointer;" onclick="try { toggleMinimap() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error:', e); }" title="Toggle Minimap">🗺️</span>
      <span style="cursor:pointer;" onclick="try { toggleZenMode() } catch (error) { console.error("Error:", error); } catch(e) { console.error('Click handler error: ', e); }" title="Zen Mode">🧘</span>
    `;
    statusRight.insertBefore(controls, statusRight.firstChild);
  }'
    }, UI_CONSTANTS.ANIMATION_VERY_SLOW);

// Zen mode styles`
const style = document.createElement('style');
style.textContent = `
  .zen-mode .sidebar, .zen-mode .activity-bar, .zen-mode .top-bar, .zen-mode .status-bar, .zen-mode .tabs { display: none !important; }
  .zen-mode .editor-container { margin: 0 !important; }`
`;
document.head.appendChild(style);
`