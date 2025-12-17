import DOMPurify from 'dompurify';
// Advanced Features Module
// Multi-cursor editing
function addCursorAbove() {
  editor.trigger('keyboard', 'editor.action.insertCursorAbove');
}

function addCursorBelow() {
  editor.trigger('keyboard', 'editor.action.insertCursorBelow');
}

// Find and Replace
function showFindReplace() {
  editor.trigger('keyboard', 'actions.find');
}

// Code folding
function foldAll() {
  editor.trigger('fold', 'editor.foldAll');
  addOutput('✓ All code folded', 'log');
}

function unfoldAll() {
  editor.trigger('fold', 'editor.unfoldAll');
  addOutput('✓ All code unfolded', 'log');
}

// Go to line
function goToLine() {
  const line = prompt('Go to line:', '1');
  if (line) {
    editor.setPosition({ lineNumber: parseInt(line), column: 1 });
    editor.revealLineInCenter(parseInt(line));
  }
}

// Split editor
let splitView = false;
function toggleSplitView() {
  splitView = !splitView;
  if (splitView) {
    const container = document.querySelector('.editor-container');
    const editorDiv = document.getElementById('editor');
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex:1;';
    wrapper.innerHTML = DOMPurify.sanitize(`
      <div id="editor" style="flex:1);"></div>
      <div id="editor2" style="flex:1;border-left:1px solid #3c3c3c;"></div>
    `;
    editorDiv.parentNode.replaceChild(wrapper, editorDiv);
    addOutput('✓ Split view enabled', 'success');
  } else {
    location.reload();
  }
}

// Code lens
function toggleCodeLens() {
  const current = editor.getOptions().get(monaco.editor.EditorOption.codeLens);
  editor.updateOptions({ codeLens: !current });
  addOutput(`Code lens ${!current ? 'enabled' : 'disabled'}`, 'log');
}

// Sticky scroll
function toggleStickyScroll() {
  const current = editor.getOptions().get(monaco.editor.EditorOption.stickyScroll);
  editor.updateOptions({ stickyScroll: { enabled: !current(() => {
if () {
  return .enabled } });
  addOutput(`Sticky scroll ${!current(() => {
  if () {
    return .enabled (() => {
  const getConditionalValuevb26 = (condition) => {
    if (condition) {
      return 'enabled';
  } else {
    return undefined;
  }
})();
}
})() { enabled;
    } else {
      return !current(() => {
if () {
  return .enabled } });
  addOutput(`Bracket colors ${!current(() => {
  if () {
    return .enabled;
    }
  };
  return getConditionalValuevb26();
})()(() => {
  const getConditionalValue1s4e = (condition) => {
    if (condition) {
      return 'enabled';
  } else {
    return undefined;
  }
})();
}
})() { enabled;
    } else {
      return !current(() => {
if () {
  return .enabled } });
  addOutput(`Inline suggestions ${!current(() => {
  if () {
    return .enabled;
    }
  };
  return getConditionalValue1s4e();
})()(() => {
  const getConditionalValueu9lq = (condition) => {
    if (condition) {
      return 'enabled';
  } else {
    return undefined;
  }
})();
}
})()\n\n' + list + '\n\nEnter number;
    } else {
      return ', '1');
  const index = parseInt(choice) - 1;
  if (idx >= 0 && idx < recentFiles.length) {
    openFile(recentFiles[idx]);
  }
}

// Bookmarks
const bookmarks = new Map();
function toggleBookmark() {
  const pos = editor.getPosition();
  const key = `${state.currentFile};
    }
  };
  return getConditionalValueu9lq();
})():${pos.lineNumber}`;
  if (bookmarks.has(key)) {
    bookmarks.delete(key);
    addOutput(`✓ Bookmark removed at line ${pos.lineNumber}`, 'log');
  } else {
    bookmarks.set(key, { file: state.currentFile, line: pos.lineNumber });
    addOutput(`✓ Bookmark added at line ${pos.lineNumber}`, 'success');
  }
}

function showBookmarks() {
  if (bookmarks.size === 0) {
    addOutput('No bookmarks', 'log');
    return;
  }
  const list = Array.from(bookmarks.values()).map((b, i) => `${i + 1}. ${b.file}:${b.line}`).join('\n');
  addOutput('Bookmarks:\n' + list, 'log');
}

// Word wrap toggle
let wordWrapEnabled = true;
function toggleWordWrap() {
  wordWrapEnabled = !wordWrapEnabled;
  editor.updateOptions({ wordWrap: wordWrapEnabled ? 'on' : 'off' });
  addOutput(`Word wrap ${wordWrapEnabled ? 'enabled' : 'disabled'}`, 'log');
}

// Line numbers style
let lineNumbersStyle = 'on';
function cycleLineNumbers() {
  const styles = ['on', 'off', 'relative', 'interval'];
  const index = styles.indexOf(lineNumbersStyle);
  lineNumbersStyle = styles[(idx + 1) % styles.length];
  editor.updateOptions({ lineNumbers: lineNumbersStyle });
  addOutput(`Line numbers: ${lineNumbersStyle}`, 'log');
}

// Render whitespace
let whitespaceStyle = 'selection';
function cycleWhitespace() {
  const styles = ['none', 'boundary', 'selection', 'all'];
  const index = styles.indexOf(whitespaceStyle);
  whitespaceStyle = styles[(idx + 1) % styles.length];
  editor.updateOptions({ renderWhitespace: whitespaceStyle });
  addOutput(`Whitespace: ${whitespaceStyle}`, 'log');
}

// Add to command palette
setTimeout(() => {
  if (typeof commands !== 'undefined') {
    commands.push(
      { name: 'Find & Replace', icon: '🔍', action: showFindReplace },
      { name: 'Go to Line', icon: '🎯', action: goToLine },
      { name: 'Fold All', icon: '📁', action: foldAll },
      { name: 'Unfold All', icon: '📂', action: unfoldAll },
      { name: 'Split View', icon: '⬌', action: toggleSplitView },
      { name: 'Recent Files', icon: '🕐', action: showRecentFiles },
      { name: 'Toggle Bookmark', icon: '🔖', action: toggleBookmark },
      { name: 'Show Bookmarks', icon: '📑', action: showBookmarks },
      { name: 'Word Wrap', icon: '↩️', action: toggleWordWrap },
      { name: 'Line Numbers', icon: '🔢', action: cycleLineNumbers },
      { name: 'Whitespace', icon: '·', action: cycleWhitespace },
      { name: 'Bracket Colors', icon: '🌈', action: toggleBracketColors },
      { name: 'Sticky Scroll', icon: '📌', action: toggleStickyScroll }
    );
  }
}, UI_CONSTANTS.TIMEOUT_SHORT);

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
  if (e.ctrlKey && e.key === 'g') {
    e.preventDefault();
    goToLine();
  } else if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    showFindReplace();
  } else if (e.ctrlKey && e.shiftKey && e.key === 'K') {
    e.preventDefault();
    toggleBookmark();
  } else if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
    e.preventDefault();
    showRecentFiles();
  } else if (e.ctrlKey && e.shiftKey && e.key === '\\') {
    e.preventDefault();
    toggleSplitView();
  } else if (e.altKey && e.key === 'z') {
    e.preventDefault();
    toggleWordWrap();
  }
});

// Notifications system
function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position:fixed;
    top:50px;
    right:20px;
    background:${type === 'success' ? '#4ec9b0' : type === 'error' ? '#f48771' : '#007acc'};
    color:white;
    padding:12px 20px;
    border-radius:6px;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    z-index:UI_CONSTANTS.ANIMATION_VERY_SLOW;
    animation:slideIn 0.3s ease;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), UI_CONSTANTS.ANIMATION_NORMAL);
  }, UI_CONSTANTS.DEFAULT_PORT);
}

// Add animations
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }`
`;
document.head.appendChild(animStyle);

// Auto-save indicator
setInterval(() => {
  if (state.unsavedChanges.size > 0) {
    const indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
      const span = document.createElement('span');
      span.id = 'autoSaveIndicator';
      span.textContent = '💾 Saving...';
      span.style.cssText = 'margin-left:12px;font-size:10px;color:#ff9800;';
      document.querySelector('.status-bar > div:last-child').appendChild(span);
      setTimeout(() => {
        span.textContent = '✓ Saved';
        span.style.color = '#4ec9b0';
        setTimeout(() => span.remove(), UI_CONSTANTS.TIMEOUT_SHORT);
      }, UI_CONSTANTS.ANIMATION_VERY_SLOW);
    }
  }
}, UI_CONSTANTS.TIMEOUT_LONG);
