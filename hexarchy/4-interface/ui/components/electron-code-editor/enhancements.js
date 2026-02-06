import DOMPurify from 'dompurify'

let currentFontSize = 14
let minimapEnabled = true

function changeFontSize(delta) {
  currentFontSize = Math.max(10, Math.min(24, currentFontSize + delta))
  editor.updateOptions({ fontSize: currentFontSize })
  document.getElementById('fontSize').textContent = currentFontSize + 'px'
}

function toggleMinimap() {
  minimapEnabled = !minimapEnabled
  editor.updateOptions({ minimap: { enabled: minimapEnabled } })
  addOutput(`Minimap ${minimapEnabled ? 'enabled' : 'disabled'}`, 'log')
}

function toggleZenMode() {
  document.body.classList.toggle('zen-mode')
  addOutput('Zen mode toggled (Press Esc to exit)', 'log')
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
  { name: 'Toggle Minimap', icon: '🗺️', action: () => toggleMinimap() },
]

function showCommandPalette() {
  const palette = document.getElementById('commandPalette')
  if (!palette) {
    const div = document.createElement('div')
    div.id = 'commandPalette'
    div.style.cssText =
      'position:fixed;top:20%;left:50%;transform:translateX(-50%);width:600px;background:#252526;border:1px solid #007acc;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.8);z-index:10000;'
    div.innerHTML = DOMPurify.sanitize(`
      <input type="text" id="commandInput" placeholder="Type a command..." style="width:100%;padding:16px;background:#1e1e1e;border:none;color:#ccc;font-size:16px;border-radius:8px 8px 0 0;">
      <div id="commandList" style="max-height:400px;overflow-y:auto;"></div>
    `)

    // Add event listener instead of inline onkeyup
    div.querySelector('#commandInput').addEventListener('keyup', filterCommands)
    document.body.appendChild(div)
  }
  document.getElementById('commandPalette').style.display = 'block'
  document.getElementById('commandInput').focus()
  renderCommands(commands)
}

function hideCommandPalette() {
  const palette = document.getElementById('commandPalette')
  if (palette) {
    palette.style.display = 'none'
    document.getElementById('commandInput').value = ''
  }
}

function renderCommands(cmds) {
  const list = document.getElementById('commandList')
  list.innerHTML = ''

  cmds.forEach((cmd, i) => {
    const div = document.createElement('div')
    div.style.cssText =
      'padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;'
    div.innerHTML = DOMPurify.sanitize(`
      <span style="font-size:20px;">${cmd.icon}</span>
      <span>${cmd.name}</span>
    `)

    div.addEventListener('click', () => {
      cmd.action()
      hideCommandPalette()
    })

    div.addEventListener('mouseover', () => (div.style.background = '#2a2d2e'))
    div.addEventListener('mouseout', () => (div.style.background = 'transparent'))

    list.appendChild(div)
  })
}

function filterCommands() {
  const query = document.getElementById('commandInput').value.toLowerCase()
  const filtered = commands.filter((c) => c.name.toLowerCase().includes(query))
  renderCommands(filtered)
}

function formatCode() {
  editor.getAction('editor.action.formatDocument').run()
  addOutput('✓ Code formatted', 'success')
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault()
    showCommandPalette()
  } else if (e.key === 'Escape') {
    hideCommandPalette()
    if (document.body.classList.contains('zen-mode')) {
      document.body.classList.remove('zen-mode')
    }
  } else if (e.ctrlKey && e.key === '=') {
    e.preventDefault()
    changeFontSize(1)
  } else if (e.ctrlKey && e.key === '-') {
    e.preventDefault()
    changeFontSize(-1)
  }
})

setTimeout(() => {
  const breadcrumb = document.createElement('div')
  breadcrumb.style.cssText =
    'background:#2d2d30;padding:4px 12px;font-size:12px;color:#969696;border-bottom:1px solid #3c3c3c;display:flex;align-items:center;gap:8px;'
  breadcrumb.innerHTML = DOMPurify.sanitize(
    '<span style="cursor:pointer;">🏠 HOOTNER</span><span>›</span><span id="currentPath">untitled.js</span>'
  )
  const tabs = document.getElementById('tabs')
  if (tabs) tabs.parentNode.insertBefore(breadcrumb, tabs)
}, 100)

setTimeout(() => {
  const statusRight = document.querySelector('.status-bar > div:last-child')
  if (statusRight) {
    const controls = document.createElement('div')
    controls.style.cssText = 'display:flex;align-items:center;gap:12px;'
    controls.innerHTML = DOMPurify.sanitize(`
      <span style="cursor:pointer;" title="Decrease Font">🔽</span>
      <span id="fontSize" style="font-size:10px;">14px</span>
      <span style="cursor:pointer;" title="Increase Font">🔼</span>
      <span style="cursor:pointer;" title="Toggle Minimap">🗺️</span>
      <span style="cursor:pointer;" title="Zen Mode">🧘</span>
    `)

    // Add event listeners instead of inline onclick
    const spans = controls.querySelectorAll('span[style*="cursor:pointer"]')
    spans[0].addEventListener('click', () => changeFontSize(-1))
    spans[2].addEventListener('click', () => changeFontSize(1))
    spans[3].addEventListener('click', toggleMinimap)
    spans[4].addEventListener('click', toggleZenMode)
    statusRight.insertBefore(controls, statusRight.firstChild)
  }
}, 100)

const style = document.createElement('style')
style.textContent = `
  .zen-mode .sidebar, .zen-mode .activity-bar, .zen-mode .top-bar, .zen-mode .status-bar, .zen-mode .tabs { display: none !important; }
  .zen-mode .editor-container { margin: 0 !important; }
`
document.head.appendChild(style)
