import DOMPurify from 'dompurify';

function addCursorAbove() { editor.trigger('keyboard', 'editor.action.insertCursorAbove'); }

function addCursorBelow() { editor.trigger('keyboard', 'editor.action.insertCursorBelow'); }

function showFindReplace() { editor.trigger('keyboard', 'actions.find'); }

function foldAll() { editor.trigger('fold', 'editor.foldAll');
  addOutput('✓ All code folded', 'log'); }

function unfoldAll() { editor.trigger('fold', 'editor.unfoldAll');
  addOutput('✓ All code unfolded', 'log'); }

function goToLine() { const line = prompt('Go to line:', '1');
  if (line) { editor.setPosition({ lineNumber: parseInt(line), column: 1 });
    editor.revealLineInCenter(parseInt(line)); } }

let splitView = false;
function toggleSplitView() { 
  try {
    splitView = !splitView;
    if (splitView) { 
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex:1;';
      wrapper.innerHTML = DOMPurify.sanitize(`
        <div id="editor" style="flex:1;"></div>
        <div id="editor2" style="flex:1;border-left:1px solid #3c3c3c;"></div>
      `);
      const editorEl = document.getElementById('editor');
      if (editorEl && editorEl.parentNode) {
        editorEl.parentNode.replaceChild(wrapper, editorEl);
        addOutput('✓ Split view enabled', 'success');
      }
    } else { 
      location.reload(); 
    }
  } catch (error) {
    console.error('Split view error:', error);
    addOutput('❌ Split view failed', 'error');
  }
}

function toggleCodeLens() { const current = editor.getOptions().get(monaco.editor.EditorOption.codeLens);
  editor.updateOptions({ codeLens: !current });
  addOutput(`Code lens ${!current ? 'enabled' : 'disabled'}`, 'log'); }

function toggleStickyScroll() { const current = editor.getOptions().get(monaco.editor.EditorOption.stickyScroll);
  editor.updateOptions({ stickyScroll: { enabled: !current?.enabled } });
  addOutput(`Sticky scroll ${!current?.enabled ? 'enabled' : 'disabled'}`, 'log'); }

const bookmarks = new Map();
function toggleBookmark() { const pos = editor.getPosition();
  const key = `${state.currentFile}:${pos.lineNumber}`;
  if (bookmarks.has(key)) { bookmarks.delete(key);
    addOutput(`✓ Bookmark removed at line ${pos.lineNumber}`, 'log'); } else { bookmarks.set(key, { file: state.currentFile, line: pos.lineNumber });
    addOutput(`✓ Bookmark added at line ${pos.lineNumber}`, 'success'); } }

function showBookmarks() { if (bookmarks.size === 0) { addOutput('No bookmarks', 'log');
    return; }
  const list = Array.from(bookmarks.values()).map((b, i) => `${i + 1}. ${b.file}:${b.line}`).join('\n');
  addOutput('Bookmarks:\n' + list, 'log'); }

let wordWrapEnabled = true;
function toggleWordWrap() { wordWrapEnabled = !wordWrapEnabled;
  editor.updateOptions({ wordWrap: wordWrapEnabled ? 'on' : 'off' });
  addOutput(`Word wrap ${wordWrapEnabled ? 'enabled' : 'disabled'}`, 'log'); }

let lineNumbersStyle = 'on';
function cycleLineNumbers() { const styles = ['on', 'off', 'relative', 'interval'];
  const index = styles.indexOf(lineNumbersStyle);
  lineNumbersStyle = styles[(index + 1) % styles.length];
  editor.updateOptions({ lineNumbers: lineNumbersStyle });
  addOutput(`Line numbers: ${lineNumbersStyle}`, 'log'); }

let whitespaceStyle = 'selection';
function cycleWhitespace() { const styles = ['none', 'boundary', 'selection', 'all'];
  const index = styles.indexOf(whitespaceStyle);
  whitespaceStyle = styles[(index + 1) % styles.length];
  editor.updateOptions({ renderWhitespace: whitespaceStyle });
  addOutput(`Whitespace: ${whitespaceStyle}`, 'log'); }

setTimeout(() => { if (typeof commands !== 'undefined') { commands.push(
      { name: 'Find & Replace', icon: '🔍', action: showFindReplace },
      { name: 'Go to Line', icon: '🎯', action: goToLine },
      { name: 'Fold All', icon: '📁', action: foldAll },
      { name: 'Unfold All', icon: '📂', action: unfoldAll },
      { name: 'Split View', icon: '⬌', action: toggleSplitView },
      { name: 'Toggle Bookmark', icon: '🔖', action: toggleBookmark },
      { name: 'Show Bookmarks', icon: '📑', action: showBookmarks },
      { name: 'Word Wrap', icon: '↩️', action: toggleWordWrap },
      { name: 'Line Numbers', icon: '🔢', action: cycleLineNumbers },
      { name: 'Whitespace', icon: '·', action: cycleWhitespace }
    ); } }, 100);

document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'g') { e.preventDefault();
    goToLine(); } else if (e.ctrlKey && e.key === 'f') { e.preventDefault();
    showFindReplace(); } else if (e.ctrlKey && e.shiftKey && e.key === 'K') { e.preventDefault();
    toggleBookmark(); } else if (e.ctrlKey && e.key === 'p' && !e.shiftKey) { e.preventDefault(); } else if (e.ctrlKey && e.shiftKey && e.key === '\\') { e.preventDefault();
    toggleSplitView(); } else if (e.altKey && e.key === 'z') { e.preventDefault();
    toggleWordWrap(); } });

function showNotification(message, type = 'info') { const notif = document.createElement('div');
  notif.style.cssText = `
    position:fixed;top:50px;right:20px;
    background:${type === 'success' ? '#4ec9b0' : type === 'error' ? '#f48771' : '#007acc'};
    color:white;padding:12px 20px;border-radius:6px;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:1000;animation:slideIn 0.3s ease;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => { notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300); }, 3000); }

const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(animStyle);
