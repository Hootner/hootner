/**
 * Enhanced Debugger with AI Snooze and Breakpoints
 *//

class DebugEnhancer {
  constructor() {
    this.breakpoints = new Map();
    this.snoozedSuggestions = [];
    this.sessions = [];
  }

  addBreakpoint(file, line) {
    const key = `${file}:${line}`;
    this.breakpoints.set(key, { file, line, active: true });
    this.logSession('breakpointAdded', { file, line });
  }

  removeBreakpoint(file, line) {
    const key = `${file}:${line}`;
    this.breakpoints.delete(key);
    this.logSession('breakpointRemoved', { file, line });
  }

  snoozeSuggestion(suggestion, duration = 3600000) {
    this.snoozedSuggestions.push({
      suggestion,
      until: Date.now() + duration,
      snoozedAt: Date.now()
    });
    this.logSession('suggestionSnoozed', { suggestion, duration });
  }

  getActiveSuggestions() {
    const now = Date.now();
    this.snoozedSuggestions = this.snoozedSuggestions.filter(s => s.until > now);
    return this.snoozedSuggestions;
  }

  logSession(action, data) {
    this.sessions.push({
      action,
      data,
      timestamp: Date.now()
    });
  }

  exportSessions() {
    return {
      sessions: this.sessions,
      breakpoints: Array.from(this.breakpoints.values()),
      snoozed: this.snoozedSuggestions
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugEnhancer;
}
