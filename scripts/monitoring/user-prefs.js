class UserPrefsManager {
  constructor() {
    this.prefs = JSON.parse(localStorage.getItem('userPrefs')) || { theme: 'dark', layout: 'default' };
    this.init();
  }

  init() {
    this.applyTheme();
    this.makeModular();
    window.addEventListener('beforeunload', () => this.save());
  }

  applyTheme() {
    document.body.classList.add(`theme-${this.prefs.theme}`);
  }

  makeModular() {
    const statsContainer = document.querySelector('.stats');
    if (statsContainer && typeof Sortable !== 'undefined') {
      new Sortable(statsContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => this.saveLayout()
      });
    }
  }

  saveLayout() {
    this.prefs.layout = Array.from(document.querySelectorAll('.stat-card')).map(card => card.querySelector('h3').textContent);
    this.save();
  }

  setTheme(theme) {
    this.prefs.theme = theme;
    document.body.className = `theme-${theme}`;
    this.save();
  }

  save() {
    localStorage.setItem('userPrefs', JSON.stringify(this.prefs));
  }
}

const prefsManager = new UserPrefsManager();
if (typeof module !== 'undefined' && module.exports) module.exports = UserPrefsManager;
