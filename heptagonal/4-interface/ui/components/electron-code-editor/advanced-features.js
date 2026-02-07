 import DOMPurify from 'dompurify'

const safeEditor = () => typeof editor !== 'undefined' ? editor : null
const safeState = () => typeof state !== 'undefined' ? state : { currentFile: 'untitled' }

function withEditor(fn, errorMsg = 'Editor not ready') {
  const ed = safeEditor()
  if (!ed) return showNotification(errorMsg, 'error')
  try {
    return fn(ed)
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error')
  }
}

function addCursorAbove() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.insertCursorAbove'))
}

function addCursorBelow() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.insertCursorBelow'))
}

function showFindReplace() {
  withEditor(ed => ed.trigger('keyboard', 'actions.find'))
}

function foldAll() {
  editor.trigger('fold', 'editor.foldAll')
  addOutput('✓ All code folded', 'log')
}

function unfoldAll() {
  editor.trigger('fold', 'editor.unfoldAll')
  addOutput('✓ All code unfolded', 'log')
}

function goToLine() {
  withEditor(ed => {
    const line = prompt('Go to line:', '1')
    if (line && !isNaN(line)) {
      const lineNum = parseInt(line, 10)
      ed.setPosition({ lineNumber: lineNum, column: 1 })
      ed.revealLineInCenter(lineNum)
      showNotification(`Jumped to line ${lineNum}`, 'success')
    }
  })
}

let splitView = false
function toggleSplitView() {
  splitView = !splitView
  if (splitView) {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'display:flex;flex:1;'
    wrapper.innerHTML = DOMPurify.sanitize(`
      <div id="editor" style="flex:1;"></div>
      <div id="editor2" style="flex:1;border-left:1px solid #3c3c3c;"></div>
    `)
    document
      .getElementById('editor')
      .parentNode.replaceChild(wrapper, document.getElementById('editor'))
    addOutput('✓ Split view enabled', 'success')
  } else {
    location.reload()
  }
}

function toggleCodeLens() {
  const current = editor.getOptions().get(monaco.editor.EditorOption.codeLens)
  editor.updateOptions({ codeLens: !current })
  addOutput(`Code lens ${!current ? 'enabled' : 'disabled'}`, 'log')
}

function toggleStickyScroll() {
  const current = editor.getOptions().get(monaco.editor.EditorOption.stickyScroll)
  editor.updateOptions({ stickyScroll: { enabled: !current?.enabled } })
  addOutput(`Sticky scroll ${!current?.enabled ? 'enabled' : 'disabled'}`, 'log')
}

const bookmarks = new Map()
function toggleBookmark() {
  withEditor(ed => {
    const pos = ed.getPosition()
    const st = safeState()
    const key = `${st.currentFile}:${pos.lineNumber}`
    if (bookmarks.has(key)) {
      bookmarks.delete(key)
      showNotification(`Bookmark removed at line ${pos.lineNumber}`, 'info')
    } else {
      bookmarks.set(key, { file: st.currentFile, line: pos.lineNumber })
      showNotification(`Bookmark added at line ${pos.lineNumber}`, 'success')
    }
  })
}

function showBookmarks() {
  if (bookmarks.size === 0) {
    showNotification('No bookmarks', 'info')
    return
  }
  const list = Array.from(bookmarks.values())
    .map((b, i) => `${i + 1}. ${b.file}:${b.line}`)
    .join('\n')
  addOutput('Bookmarks:\n' + list, 'log')
}

function jumpToBookmark(index) {
  withEditor(ed => {
    const bookmark = Array.from(bookmarks.values())[index]
    if (bookmark) {
      ed.setPosition({ lineNumber: bookmark.line, column: 1 })
      ed.revealLineInCenter(bookmark.line)
      showNotification(`Jumped to bookmark at line ${bookmark.line}`, 'success')
    }
  })
}

let wordWrapEnabled = true
function toggleWordWrap() {
  wordWrapEnabled = !wordWrapEnabled
  editor.updateOptions({ wordWrap: wordWrapEnabled ? 'on' : 'off' })
  showNotification(`Word wrap ${wordWrapEnabled ? 'enabled' : 'disabled'}`, 'info')
}

let lineNumbersStyle = 'on'
function cycleLineNumbers() {
  const styles = ['on', 'off', 'relative', 'interval']
  const index = styles.indexOf(lineNumbersStyle)
  lineNumbersStyle = styles[(index + 1) % styles.length]
  editor.updateOptions({ lineNumbers: lineNumbersStyle })
  showNotification(`Line numbers: ${lineNumbersStyle}`, 'info')
}

let whitespaceStyle = 'selection'
function cycleWhitespace() {
  const styles = ['none', 'boundary', 'selection', 'all']
  const index = styles.indexOf(whitespaceStyle)
  whitespaceStyle = styles[(index + 1) % styles.length]
  editor.updateOptions({ renderWhitespace: whitespaceStyle })
  showNotification(`Whitespace: ${whitespaceStyle}`, 'info')
}

function duplicateLine() {
  editor.trigger('keyboard', 'editor.action.copyLinesDownAction')
  showNotification('Line duplicated', 'success')
}

function deleteLine() {
  editor.trigger('keyboard', 'editor.action.deleteLines')
  showNotification('Line deleted', 'info')
}

function moveLinesUp() {
  editor.trigger('keyboard', 'editor.action.moveLinesUpAction')
}

function moveLinesDown() {
  editor.trigger('keyboard', 'editor.action.moveLinesDownAction')
}

function formatDocument() {
  editor.trigger('keyboard', 'editor.action.formatDocument')
  showNotification('Document formatted', 'success')
}

function commentLine() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.commentLine'))
}

function undo() {
  withEditor(ed => {
    ed.trigger('keyboard', 'undo')
    showNotification('Undo', 'info')
  })
}

function redo() {
  withEditor(ed => {
    ed.trigger('keyboard', 'redo')
    showNotification('Redo', 'info')
  })
}

function selectAll() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.selectAll'))
}

function saveFile() {
  if (typeof window.saveCurrentFile === 'function') {
    window.saveCurrentFile()
    showNotification('File saved', 'success')
  } else {
    showNotification('Save function not available', 'error')
  }
}

function selectNextOccurrence() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.addSelectionToNextFindMatch'))
}

function expandSelection() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.smartSelect.expand'))
}

function shrinkSelection() {
  withEditor(ed => ed.trigger('keyboard', 'editor.action.smartSelect.shrink'))
}

setTimeout(() => {
  if (typeof commands !== 'undefined') {
    commands.push(
      { name: 'Find & Replace', icon: '🔍', action: showFindReplace },
      { name: 'Go to Line', icon: '🎯', action: goToLine },
      { name: 'Fold All', icon: '📁', action: foldAll },
      { name: 'Unfold All', icon: '📂', action: unfoldAll },
      { name: 'Split View', icon: '⬌', action: toggleSplitView },
      { name: 'Toggle Bookmark', icon: '🔖', action: toggleBookmark },
      { name: 'Show Bookmarks', icon: '📑', action: showBookmarks },
      { name: 'Word Wrap', icon: '↩️', action: toggleWordWrap },
      { name: 'Line Numbers', icon: '🔢', action: cycleLineNumbers },
      { name: 'Whitespace', icon: '·', action: cycleWhitespace },
      { name: 'Duplicate Line', icon: '📋', action: duplicateLine },
      { name: 'Delete Line', icon: '🗑️', action: deleteLine },
      { name: 'Format Document', icon: '✨', action: formatDocument },
      { name: 'Comment Line', icon: '💬', action: commentLine },
      { name: 'Undo', icon: '↶', action: undo },
      { name: 'Redo', icon: '↷', action: redo },
      { name: 'Select All', icon: '⬚', action: selectAll },
      { name: 'Save File', icon: '💾', action: saveFile },
      { name: 'Select Next', icon: '⊕', action: selectNextOccurrence },
      { name: 'Expand Selection', icon: '⇱', action: expandSelection }
    )
  }
}, 100)

const keyBindings = {
  'ctrl+g': goToLine,
  'ctrl+f': showFindReplace,
  'ctrl+shift+k': deleteLine,
  'ctrl+k': toggleBookmark,
  'ctrl+shift+\\': toggleSplitView,
  'alt+z': toggleWordWrap,
  'ctrl+shift+b': showBookmarks,
  'ctrl+shift+d': duplicateLine,
  'alt+shift+f': formatDocument,
  'ctrl+/': commentLine,
  'alt+up': moveLinesUp,
  'alt+down': moveLinesDown,
  'ctrl+z': undo,
  'ctrl+y': redo,
  'ctrl+shift+z': redo,
  'ctrl+a': selectAll,
  'ctrl+s': saveFile,
  'ctrl+d': selectNextOccurrence,
  'shift+alt+right': expandSelection,
  'shift+alt+left': shrinkSelection
}

document.addEventListener('keydown', (e) => {
  const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`
  if (keyBindings[key]) {
    e.preventDefault()
    keyBindings[key]()
  } else if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
    e.preventDefault()
  }
  
  // Quick bookmark jump: Ctrl+1-9
  if (e.ctrlKey && !e.shiftKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault()
    jumpToBookmark(parseInt(e.key) - 1)
  }
})

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.editor-notification')
  if (existing) existing.remove()
  
  const notif = document.createElement('div')
  notif.className = 'editor-notification'
  notif.style.cssText = `
    position:fixed;top:50px;right:20px;
    background:${type === 'success' ? '#4ec9b0' : type === 'error' ? '#f48771' : '#007acc'};
    color:white;padding:12px 20px;border-radius:6px;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:1000;animation:slideIn 0.3s ease;
  `
  notif.textContent = message
  document.body.appendChild(notif)
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => notif.remove(), 300)
  }, 3000)
}

const animStyle = document.createElement('style')
animStyle.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`
document.head.appendChild(animStyle)
