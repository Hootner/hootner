import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPlatformNav, setShowPlatformNav] = useState(false);
  const [loadingPage, setLoadingPage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentlyUsedPages');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStats, setAnimatedStats] = useState({
    posts: 0,
    users: 0,
    engagement: 0,
    revenue: 0
  });

  const stats = {
    posts: 127,
    users: 1234,
    engagement: 89,
    revenue: 12400
  };

  const notifications = [
    { id: 1, icon: '🎉', message: 'New feature: Video upload now available!', time: '2m ago', unread: true },
    { id: 2, icon: '🚀', message: 'Platform deployment successful', time: '15m ago', unread: true },
    { id: 3, icon: '👥', message: '5 new users joined today', time: '1h ago', unread: false },
    { id: 4, icon: '📊', message: 'Weekly report ready to view', time: '2h ago', unread: false },
  ];

  const shortcuts = [
    { key: 'ESC', action: 'Close modal/panel' },
    { key: 'Ctrl + K', action: 'Open search' },
    { key: 'Ctrl + /', action: 'Show shortcuts' },
    { key: 'Ctrl + N', action: 'Notifications' },
    { key: 'Ctrl + T', action: 'Toggle theme' },
    { key: '1-9', action: 'Quick navigation' },
  ];

  // Platform pages configuration
  const platformPages = [
    { name: '🎥 Video Player', url: '/video-player.html', desc: 'Watch and stream videos', category: 'Media' },
    { name: '🎬 AI Video Generator', url: '/ai-video.html', desc: 'Create AI-powered videos', category: 'Media' },
    { name: '� My Videos', url: '/my-videos.html', desc: 'View & download your videos', category: 'Media' },    { name: '📤 Upload Video', url: '/upload-video.html', desc: 'Upload your own videos', category: 'Media' },    { name: '�📺 Live Stream', url: '/live-stream.html', desc: 'Start live broadcasting', category: 'Media' },
    { name: '💻 Code Editor', url: '/code-editor.html', desc: 'Advanced code editing', category: 'Development' },
    { name: '⚡ Ultra Editor', url: '/ultra-editor.html', desc: 'Premium code editor', category: 'Development' },
    { name: '🤖 Auto Editor', url: '/auto-editor.html', desc: 'AI-assisted coding', category: 'Development' },
    { name: '👥 Collaboration', url: '/collaboration.html', desc: 'Real-time team workspace', category: 'Productivity' },
    { name: '💬 Messages', url: '/messages.html', desc: 'Chat and messaging', category: 'Productivity' },
    { name: '📊 Analytics', url: '/analytics.html', desc: 'Advanced analytics dashboard', category: 'Business' },
    { name: '🛍️ Marketplace', url: '/marketplace.html', desc: 'Buy and sell content', category: 'Business' },
    { name: '🤖 AI Agents', url: '/agent-management.html', desc: 'Manage AI assistants', category: 'AI' },
    { name: '🔧 DevOps', url: '/devops-monitoring.html', desc: 'Infrastructure monitoring', category: 'Operations' },
    { name: '🎨 Design Showcase', url: '/design-showcase.html', desc: 'UI/UX examples', category: 'Creative' },
    { name: '📱 Social Feed', url: '/feed-react.html', desc: 'Social media feed', category: 'Social' },
    { name: '⚡ Live Activity', url: '/live-activity.html', desc: 'Real-time updates', category: 'Social' },
    { name: '👤 Profile', url: '/profile.html', desc: 'User profile management', category: 'Account' },
    { name: '⚙️ Settings', url: '/settings.html', desc: 'Platform settings', category: 'Account' },
    { name: '📞 Contact', url: '/contact.html', desc: 'Get in touch', category: 'Support' },
    { name: '🏠 Main Dashboard', url: '/dashboard.html', desc: 'HTML dashboard view', category: 'Core' },
  ];

  const categories = [...new Set(platformPages.map(p => p.category))];

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        posts: Math.floor(stats.posts * progress),
        users: Math.floor(stats.users * progress),
        engagement: Math.floor(stats.engagement * progress),
        revenue: Math.floor(stats.revenue * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC - close any open panel
      if (e.key === 'Escape') {
        setShowPlatformNav(false);
        setShowShortcuts(false);
        setShowNotifications(false);
      }

      // Ctrl + / - shortcuts panel
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }

      // Ctrl + N - notifications
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setShowNotifications(!showNotifications);
      }

      // Ctrl + T - theme toggle
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }

      // Number keys 1-9 for quick tab navigation
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey) {
        const tabs = ['overview', 'analytics', 'moderation', 'system'];
        const index = parseInt(e.key) - 1;
        if (tabs[index]) setActiveTab(tabs[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, showNotifications, theme]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Save recently used to localStorage
  useEffect(() => {
    localStorage.setItem('recentlyUsedPages', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  const openPage = (url: string, pageName: string) => {
    setLoadingPage(url);

    // Track recently used
    setRecentlyUsed(prev => {
      const updated = [url, ...prev.filter(u => u !== url)].slice(0, 6);
      return updated;
    });

    // Analytics tracking
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'page_open', page: url, timestamp: Date.now() })
      }).catch(() => {}); // Silent fail for analytics
    } catch {}

    // Open page
    const newWindow = window.open(url, '_blank');

    // Check if popup was blocked
    setTimeout(() => {
      setLoadingPage(null);
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setToast({ message: '❌ Popup blocked! Enable popups for this site.', type: 'error' });
      } else {
        setToast({ message: `✅ Opening ${pageName}...`, type: 'success' });
      }
    }, 500);
  };

  const trafficData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Page Views',
      data: [1200, 1900, 1500, 2200, 1800, 2400, 2100],
      borderColor: '#00ff00',
      backgroundColor: 'rgba(0,255,0,0.1)',
      tension: 0.4
    }]
  };

  const engagementData = {
    labels: ['Videos', 'Posts', 'Comments', 'Shares'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#00ff00', '#00ffff', '#ff00ff', '#ffff00']
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#00ff00' } }
    },
    scales: {
      y: { ticks: { color: '#00ffff' }, grid: { color: 'rgba(0,255,0,0.1)' } },
      x: { ticks: { color: '#00ffff' }, grid: { color: 'rgba(0,255,0,0.1)' } }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-green-400' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-800'} p-3 sm:p-6 transition-colors duration-300`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-2xl animate-fade-in ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-bold`}>
          {toast.message}
        </div>
      )}

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-2xl p-6 max-w-md w-full border-2 border-cyan-400/30 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-cyan-400">⌨️ Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-2xl hover:text-red-400">×</button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                  <span className={`font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-blue-600'}`}>{shortcut.key}</span>
                  <span className={theme === 'dark' ? 'text-cyan-400' : 'text-gray-600'}>{shortcut.action}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">Press ESC to close</p>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-20 right-4 z-[60] w-96 max-w-[calc(100vw-2rem)]">
          <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-2xl p-4 border-2 border-cyan-400/30 shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-cyan-400">🔔 Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-xl hover:text-red-400">×</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-100'} ${notif.unread ? 'border-l-4 border-cyan-400' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{notif.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-gray-800'}`}>{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                    {notif.unread && <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg font-bold hover:opacity-90">
              Mark All Read
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Clock, Theme Toggle, Shortcuts, Notifications */}
        <div className="flex justify-between items-center mb-4 sm:mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              HOOTNER Platform
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-cyan-400/60' : 'text-gray-500'} mt-1`}>
              🕐 {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-black/20' : 'bg-white'} border ${theme === 'dark' ? 'border-cyan-400/30' : 'border-gray-300'} rounded-lg hover:scale-105 transition-all relative`}
              title="Notifications (Ctrl+N)"
            >
              🔔
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-black/20' : 'bg-white'} border ${theme === 'dark' ? 'border-cyan-400/30' : 'border-gray-300'} rounded-lg hover:scale-105 transition-all`}
              title="Shortcuts (Ctrl+/)"
            >
              ⌨️
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-black/20' : 'bg-white'} border ${theme === 'dark' ? 'border-cyan-400/30' : 'border-gray-300'} rounded-lg hover:scale-105 transition-all`}
              title="Toggle Theme (Ctrl+T)"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setShowPlatformNav(!showPlatformNav)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors text-white text-sm sm:text-base font-bold shadow-lg active:scale-95"
            >
              🚀 <span className="hidden sm:inline">All</span> Apps ({platformPages.length})
            </button>
          </div>
        </div>

        {/* Platform Navigation Modal */}
        {showPlatformNav && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPlatformNav(false)}>
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-4 sm:p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-green-400/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  🌟 Complete Platform Access
                </h2>
                <button onClick={() => setShowPlatformNav(false)} className="text-3xl sm:text-4xl hover:text-red-400 transition-colors px-3 py-1" title="Close (ESC)">
                  ✕
                </button>
              </div>

              {/* Search Box */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search apps... (try 'video', 'code', 'ai')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-green-400/30 rounded-lg text-green-400 placeholder-cyan-400/50 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                  autoFocus
                />
              </div>

              {/* Recently Used Apps */}
              {recentlyUsed.length > 0 && !searchQuery && (
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-3 border-b border-purple-400/20 pb-2">
                    ⏱️ Recently Used
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {recentlyUsed.map(url => {
                      const page = platformPages.find(p => p.url === url);
                      if (!page) return null;
                      return (
                        <button
                          key={url}
                          onClick={() => openPage(page.url, page.name)}
                          disabled={loadingPage === page.url}
                          className="bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/30 hover:border-purple-400/50 rounded-lg p-3 text-left transition-all hover:scale-105 relative disabled:opacity-50"
                        >
                          {loadingPage === page.url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                              <div className="animate-spin text-2xl">⏳</div>
                            </div>
                          )}
                          <div className="font-bold text-purple-200 text-sm">{page.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtered Categories */}
              {categories.map(category => {
                const filteredPages = platformPages.filter(p =>
                  p.category === category &&
                  (!searchQuery ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                );

                if (filteredPages.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-3 border-b border-green-400/20 pb-2">
                      {category} ({filteredPages.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredPages.map(page => (
                        <button
                          key={page.url}
                          onClick={() => openPage(page.url, page.name)}
                          disabled={loadingPage === page.url}
                          className="bg-black/40 hover:bg-black/60 border border-green-400/20 hover:border-green-400/50 rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-400/20 relative disabled:opacity-50"
                        >
                          {loadingPage === page.url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                              <div className="animate-spin text-3xl">⏳</div>
                            </div>
                          )}
                          <div className="font-bold text-green-400 mb-1">{page.name}</div>
                          <div className="text-sm text-cyan-400/80">{page.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* No Results Message */}
              {searchQuery && platformPages.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl text-cyan-400">No apps found for "{searchQuery}"</p>
                  <p className="text-sm text-cyan-400/60 mt-2">Try searching for video, code, ai, or analytics</p>
                </div>
              )}

              {/* Keyboard Shortcuts Hint */}
              <div className="mt-6 pt-4 border-t border-green-400/20 text-center text-sm text-cyan-400/60">
                💡 Tip: Press ESC to close • Type to search • Recently used saved automatically
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Mobile Responsive */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-black/20 backdrop-blur-lg rounded-lg p-1 sm:p-2 overflow-x-auto">
          {['overview', 'analytics', 'moderation', 'system', 'apps'].map(tab => (
            <button
              key={tab}
              onClick={() => tab === 'apps' ? setShowPlatformNav(true) : setActiveTab(tab)}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab && tab !== 'apps'
                  ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white'
                  : tab === 'apps'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'text-cyan-400 hover:bg-white/10 active:bg-white/20'
              }`}
            >
              {tab === 'apps' ? '🚀 All Apps' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Mobile Grid with Animated Values */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
              <StatCard title="Total Posts" value={animatedStats.posts} trend="+12%" icon="📝" />
              <StatCard title="Active Users" value={animatedStats.users.toLocaleString()} trend="+8%" icon="👥" />
              <StatCard title="Engagement" value={`${animatedStats.engagement}%`} trend="-2%" icon="📊" />
              <StatCard title="Revenue" value={`$${(animatedStats.revenue/1000).toFixed(1)}K`} trend="+24%" icon="💰" />
            </div>

            {/* Action Cards - Mobile Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ActionCard />
              <ActivityCard />
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
              <StatCard title="Total Views" value="45,231" />
              <StatCard title="Avg. Watch Time" value="4.2m" />
              <StatCard title="Conversion Rate" value="3.8%" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ChartCard title="Traffic Overview" chart={<Line data={trafficData} options={chartOptions} />} />
              <ChartCard title="User Engagement" chart={<Doughnut data={engagementData} options={{...chartOptions, scales: undefined}} />} />
            </div>
          </>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && <ModerationPanel />}

        {/* System Tab */}
        {activeTab === 'system' && <SystemPanel />}
      </div>
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: ReactNode;
  trend?: string;
  icon?: string;
};

const StatCard = ({ title, value, trend, icon }: StatCardProps) => (
  <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-3 sm:p-4 md:p-6 hover:border-green-400/40 transition-all hover:shadow-xl hover:shadow-green-400/10">
    <div className="flex items-center justify-between mb-1 sm:mb-2">
      <h3 className="text-cyan-400 text-xs sm:text-sm font-semibold">{title}</h3>
      {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
    </div>
    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-1 sm:mb-2 tabular-nums">{value}</p>
    {trend && (
      <div className={`text-xs sm:text-sm font-semibold flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        <span>{trend.startsWith('+') ? '↗' : '↘'}</span>
        <span className="hidden sm:inline">{trend} this week</span>
        <span className="sm:hidden">{trend}</span>
      </div>
    )}
  </div>
);

const ActionCard = () => {
  const quickLinks = [
    { name: '🎥 Video Player', url: '/video-player.html', colorClass: 'bg-blue-600 hover:bg-blue-700' },
    { name: '💻 Code Editor', url: '/code-editor.html', colorClass: 'bg-purple-600 hover:bg-purple-700' },
    { name: '💬 Messages', url: '/messages.html', colorClass: 'bg-green-600 hover:bg-green-700' },
    { name: '🤖 AI Agents', url: '/agent-management.html', colorClass: 'bg-pink-600 hover:bg-pink-700' },
    { name: '📊 Analytics', url: '/analytics.html', colorClass: 'bg-yellow-600 hover:bg-yellow-700' },
    { name: '🛍️ Marketplace', url: '/marketplace.html', colorClass: 'bg-indigo-600 hover:bg-indigo-700' },
  ];

  const [loadingPage, setLoadingPage] = useState<string | null>(null);

  const handleLaunch = (link: typeof quickLinks[0]) => {
    setLoadingPage(link.url);
    setTimeout(() => {
      window.open(link.url, '_blank');
      setLoadingPage(null);
    }, 300);
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">Quick Launch</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {quickLinks.map(link => (
          <button
            key={link.url}
            onClick={() => handleLaunch(link)}
            disabled={loadingPage === link.url}
            className={`p-2 sm:p-3 ${link.colorClass} rounded-lg transition-colors text-xs sm:text-sm md:text-base hover:opacity-90 shadow-md relative disabled:opacity-70 active:scale-95`}
          >
            {loadingPage === link.url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <div className="animate-spin text-xl">⏳</div>
              </div>
            )}
            {link.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const ActivityCard = () => (
  <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">🔥 Live Activity</h2>
    <div className="space-y-2 max-h-48 overflow-y-auto">
      <ActivityItem emoji="🎥" text="New video uploaded by @creator_pro" />
      <ActivityItem emoji="🚀" text="Deployment successful: v2.1.4" />
      <ActivityItem emoji="🤖" text="AI Agent 'SecurityBot' activated" />
      <ActivityItem emoji="💰" text="Payment processed: $49.99" />
    </div>
  </div>
);

type ActivityItemProps = {
  emoji: string;
  text: string;
};

const ActivityItem = ({ emoji, text }: ActivityItemProps) => (
  <div className="flex items-start gap-2 py-2 border-b border-green-400/10 last:border-b-0">
    <span className="text-lg flex-shrink-0">{emoji}</span>
    <div className="flex-1">
      <p className="text-sm text-cyan-400">{text}</p>
      <p className="text-xs text-green-400/60">Just now</p>
    </div>
  </div>
);

type ChartCardProps = {
  title: string;
  chart: ReactNode;
};

const ChartCard = ({ title, chart }: ChartCardProps) => (
  <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">{title}</h2>
    <div className="h-48 sm:h-64">{chart}</div>
  </div>
);

const ModerationPanel = () => (
  <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">Content Moderation</h2>
    <div className="space-y-4">
      <ModerationItem
        user="@user123"
        content="Check out this amazing product! Click here to buy now..."
        type="Spam"
        score="87%"
      />
      <ModerationItem
        user="@user456"
        content="This is a sample comment that was flagged for review..."
        type="Inappropriate"
        score="72%"
      />
    </div>
  </div>
);

type ModerationItemProps = {
  user: string;
  content: string;
  type: string;
  score: string;
};

const ModerationItem = ({ user, content, type, score }: ModerationItemProps) => (
  <div className="bg-black/30 p-4 rounded-lg border border-green-400/20">
    <div className="mb-2">
      <strong>{user}</strong>
      <span className="text-cyan-400 text-sm ml-2">{type} • AI Score: {score}</span>
    </div>
    <p className="text-cyan-400 mb-3">{content}</p>
    <div className="flex gap-2">
      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
        ✓ Approve
      </button>
      <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors">
        ⚠️ Warn
      </button>
      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
        ✗ Reject
      </button>
    </div>
  </div>
);

const SystemPanel = () => (
  <div className="space-y-4 sm:space-y-6">
    <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">System Health</h2>
      <div className="space-y-3">
        <ServiceStatus name="API Gateway" status="healthy" uptime="99.9%" />
        <ServiceStatus name="Auth Service" status="healthy" uptime="100%" />
        <ServiceStatus name="Video Processing" status="warning" uptime="High load" />
        <ServiceStatus name="Database" status="healthy" uptime="Optimal" />
      </div>
    </div>

    <div className="bg-black/20 backdrop-blur-sm border border-green-400/20 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-400">Resource Usage</h2>
      <ResourceBar label="CPU Usage" value={45} />
      <ResourceBar label="Memory Usage" value={62} />
      <ResourceBar label="Disk Usage" value={38} />
    </div>
  </div>
);

type ServiceStatusProps = {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | string;
  uptime: string;
};

const ServiceStatus = ({ name, status, uptime }: ServiceStatusProps) => (
  <div className="flex items-center justify-between p-3 bg-black/30 rounded border-l-4 border-green-400">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        status === 'healthy' ? 'bg-green-400' :
        status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
      }`} />
      <strong>{name}</strong>
    </div>
    <span className="text-cyan-400">{uptime}</span>
  </div>
);

type ResourceBarProps = {
  label: string;
  value: number;
};

const ResourceBar = ({ label, value }: ResourceBarProps) => (
  <div className="mb-4">
    <div className="flex justify-between mb-2">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className="bg-green-400 h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default Dashboard;
