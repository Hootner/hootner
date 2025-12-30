class AIPoweredDashboard {
  constructor() {
    this.preferences = JSON.parse(localStorage.getItem('dashboardPrefs')) || {};
    this.usage = this.preferences.usage || {};
    this.init();
  }

  init() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.trackUsage(tab.textContent.trim()));
    });
    this.personalize();
  }

  trackUsage(tabName) {
    this.usage[tabName] = (this.usage[tabName] || 0) + 1;
    this.preferences.usage = this.usage;
    localStorage.setItem('dashboardPrefs', JSON.stringify(this.preferences));
    this.notifyRecommendations();
  }

  personalize() {
    const sortedTabs = Object.entries(this.usage).sort((a, b) => b[1] - a[1]);
    if (sortedTabs.length > 0) {
      console.log('Recommended tab:', sortedTabs[0][0]);
    }
  }

  getInsights(data) {
    return `Detected upward trend in ${data.metric || 'usage'}.`;
  }

  notifyRecommendations() {
    if (typeof showSuccess === 'function') {
      const sortedTabs = Object.entries(this.usage).sort((a, b) => b[1] - a[1]);
      if (sortedTabs.length > 1) {
        showSuccess(`Based on your usage, try the ${sortedTabs[1][0]} tab next!`);
      }
    }
  }
}

const aiDashboard = new AIPoweredDashboard();
if (typeof module !== 'undefined' && module.exports) module.exports = AIPoweredDashboard;
