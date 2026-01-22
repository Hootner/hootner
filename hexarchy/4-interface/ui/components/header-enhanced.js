// Enhanced Header Component for HOOTNER
(function () {
  // Check authentication first
  const isAuthenticated = localStorage.getItem('hootner_auth_token') || sessionStorage.getItem('hootner_session');

  if (!isAuthenticated) {
    // User not logged in, don't show header
    console.log('🔒 User not authenticated - header hidden');
    return;
  }

  const headerHTML = `
    <nav class="bg-slate-900 border-b border-slate-700 sticky top-0 z-50" style="height: 70px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000;">
      <div style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 24px;">
          <a href="/" style="font-size: 18px; font-weight: bold; background: linear-gradient(135deg, #00ff00, #00ffff, #ff00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-decoration: none;">🦉 HOOTNER</a>

          <div style="position: relative;">
            <button onclick="toggleNotifications()" style="background: none; border: none; color: #00ffff; cursor: pointer; font-size: 20px; padding: 12px; position: relative; border-radius: 50%; transition: all 0.3s;" title="Notifications" onmouseover="this.style.background='rgba(0,255,255,0.1)'; this.style.boxShadow='0 0 15px rgba(0,255,255,0.3)'" onmouseout="this.style.background='none'; this.style.boxShadow='none'">
              🔔
              <span id="notif-badge" style="position: absolute; top: 4px; right: 4px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; animation: pulse 2s infinite; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);">3</span>
            </button>

            <div id="notif-dropdown" style="display: none; position: fixed; top: 60px; right: 20px; width: 400px; max-width: calc(100vw - 40px); max-height: calc(100vh - 80px); background: rgba(10, 10, 15, 0.98); border: 2px solid rgba(0, 255, 0, 0.3); border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8); z-index: 9999; flex-direction: column; overflow: hidden;">
              <div style="padding: 12px 16px; border-bottom: 1px solid rgba(0, 255, 0, 0.2); flex-shrink: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h3 style="color: #00ff00; font-size: 16px; font-weight: bold; margin: 0;">Notifications</h3>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="toggleNotifSound()" id="sound-btn" style="background: none; border: none; color: #00ffff; cursor: pointer; font-size: 16px;" title="Toggle sound">🔔</button>
                    <button onclick="clearAllNotifications()" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px;" title="Clear all">🗑️</button>
                    <button onclick="markAllRead()" style="background: none; border: none; color: #00ffff; cursor: pointer; font-size: 12px;">Mark all read</button>
                  </div>
                </div>
                <input type="text" id="notif-search" oninput="filterNotifications()" placeholder="🔍 Search notifications..." style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 4px; color: #00ff00; font-size: 13px; margin-bottom: 8px;">
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button class="notif-filter active" data-filter="all" onclick="setNotifFilter('all')" style="padding: 4px 12px; background: rgba(0, 255, 255, 0.2); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 12px; color: #00ffff; font-size: 11px; cursor: pointer;">All</button>
                  <button class="notif-filter" data-filter="like" onclick="setNotifFilter('like')" style="padding: 4px 12px; background: transparent; border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 12px; color: #00ff00; font-size: 11px; cursor: pointer;">❤️ Likes</button>
                  <button class="notif-filter" data-filter="comment" onclick="setNotifFilter('comment')" style="padding: 4px 12px; background: transparent; border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 12px; color: #00ff00; font-size: 11px; cursor: pointer;">💬 Comments</button>
                  <button class="notif-filter" data-filter="follow" onclick="setNotifFilter('follow')" style="padding: 4px 12px; background: transparent; border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 12px; color: #00ff00; font-size: 11px; cursor: pointer;">👤 Follows</button>
                  <button class="notif-filter" data-filter="system" onclick="setNotifFilter('system')" style="padding: 4px 12px; background: transparent; border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 12px; color: #00ff00; font-size: 11px; cursor: pointer;">⚠️ System</button>
                </div>
              </div>
              <div id="notif-list" style="flex: 1; overflow-y: auto; min-height: 200px; max-height: calc(100vh - 280px);"></div>
              <div style="padding: 12px; text-align: center; border-top: 1px solid rgba(0, 255, 0, 0.2); display: flex; gap: 8px; justify-content: center;">
                <button onclick="loadMoreNotifications()" style="background: none; border: none; color: #00ffff; font-size: 13px; cursor: pointer; text-decoration: underline;">Load more</button>
                <span style="color: #6b7280;">•</span>
                <a href="#" style="color: #00ffff; font-size: 13px; text-decoration: none;">View all</a>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; align-items: center;">
          <a href="/collaboration" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">🤝 Collaborate</a>
          <a href="/agent-management" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">🤖 AI Agents</a>
          <a href="/devops-monitoring" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">⚡ DevOps</a>
          <a href="/marketplace" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">🛒 Marketplace</a>
          <a href="/messages" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">💬 Messages</a>
          <a href="/contact" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">📧 Contact</a>
          <a href="/video-player" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">▶️ Video</a>
          <a href="/code-editor" style="font-size: 14px; text-decoration: none; padding: 8px 12px; color: #94a3b8; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">💻 Code</a>

          <div style="height: 24px; width: 1px; background: rgba(148, 163, 184, 0.3);"></div>

          <div style="position: relative;">
            <button onclick="toggleUserMenu()" style="display: flex; align-items: center; gap: 8px; background: rgba(0, 255, 0, 0.1); border: 1px solid rgba(0, 255, 0, 0.3); border-radius: 20px; padding: 6px 12px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(0, 255, 0, 0.2)'; this.style.borderColor='rgba(0, 255, 0, 0.5)'" onmouseout="this.style.background='rgba(0, 255, 0, 0.1)'; this.style.borderColor='rgba(0, 255, 0, 0.3)'">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #00ff00, #00ffff); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #000;">👤</div>
              <span id="username-display" style="color: #00ff00; font-size: 14px; font-weight: 600;">User</span>
              <span style="color: #00ffff; font-size: 12px;">▼</span>
            </button>

            <div id="user-menu" style="display: none; position: absolute; top: 45px; right: 0; width: 200px; background: rgba(10, 10, 15, 0.98); border: 2px solid rgba(0, 255, 0, 0.3); border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8); z-index: 9999; overflow: hidden;">
              <a href="/profile" style="display: block; padding: 12px 16px; color: #00ffff; text-decoration: none; font-size: 14px; border-bottom: 1px solid rgba(0, 255, 0, 0.1); transition: background 0.2s;" onmouseover="this.style.background='rgba(0, 255, 0, 0.1)'" onmouseout="this.style.background='transparent'">👤 Profile</a>
              <a href="/settings" style="display: block; padding: 12px 16px; color: #00ffff; text-decoration: none; font-size: 14px; border-bottom: 1px solid rgba(0, 255, 0, 0.1); transition: background 0.2s;" onmouseover="this.style.background='rgba(0, 255, 0, 0.1)'" onmouseout="this.style.background='transparent'">⚙️ Settings</a>
              <a href="/login" onclick="event.preventDefault(); handleLogout();" style="display: block; padding: 12px 16px; color: #ef4444; text-decoration: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">🔐 Logout</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.style.paddingTop = '80px';

  // Notification System
  let notifications = [
    { id: 1, type: 'like', user: 'sarah_dev', text: 'liked your post "Building Scalable Microservices"', time: '5m ago', timestamp: Date.now() - 300000, unread: true, icon: '❤️', group: 'today' },
    { id: 2, type: 'comment', user: 'alex_codes', text: 'commented on your video', time: '1h ago', timestamp: Date.now() - 3600000, unread: true, icon: '💬', group: 'today' },
    { id: 3, type: 'follow', user: 'tech_guru', text: 'started following you', time: '2h ago', timestamp: Date.now() - 7200000, unread: true, icon: '👤', group: 'today' }
  ];
  let notifFilter = 'all';
  let notifSoundEnabled = true;

  window.toggleNotifications = function () {
    const dropdown = document.getElementById('notif-dropdown');
    const isVisible = dropdown.style.display === 'flex';
    dropdown.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) renderNotifications();
  };

  window.renderNotifications = function () {
    const container = document.getElementById('notif-list');
    if (!container) return;
    const searchQuery = document.getElementById('notif-search')?.value.toLowerCase() || '';
    let filtered = notifications.filter(n => {
      if (notifFilter !== 'all' && n.type !== notifFilter) return false;
      if (searchQuery && !n.text.toLowerCase().includes(searchQuery) && !n.user.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#6b7280;font-size:13px;">No notifications found</div>';
      return;
    }

    const grouped = { today: [], yesterday: [], older: [] };
    filtered.forEach(n => grouped[n.group].push(n));

    let html = '';
    ['today', 'yesterday', 'older'].forEach(group => {
      if (grouped[group].length > 0) {
        html += `<div style="padding:8px 16px;background:rgba(0,255,0,0.05);border-bottom:1px solid rgba(0,255,0,0.1);font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;">${group}</div>`;
        html += grouped[group].map(n => `
          <div class="notif-item ${n.unread ? 'unread' : ''}" style="padding:12px 16px;border-bottom:1px solid rgba(0,255,0,0.1);cursor:pointer;transition:background 0.2s;${n.unread ? 'background:rgba(0,255,255,0.05);border-left:3px solid #00ffff;' : ''}" onmouseover="this.style.background='rgba(0,255,0,0.05)'" onmouseout="this.style.background='${n.unread ? 'rgba(0,255,255,0.05)' : 'transparent'}'">
            <div style="display:flex;gap:12px;align-items:start;">
              <div style="font-size:24px;flex-shrink:0;">${n.icon}</div>
              <div style="flex:1;min-width:0;" onclick="markRead(${n.id})">
                <div style="color:#00ff00;font-weight:bold;font-size:13px;margin-bottom:4px;">@${n.user}</div>
                <div style="color:#00ffff;font-size:13px;margin-bottom:4px;">${n.text}</div>
                <div style="color:#6b7280;font-size:11px;">${n.time}</div>
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0;">
                ${n.unread ? '<div style="width:8px;height:8px;background:#00ffff;border-radius:50%;margin-top:6px;"></div>' : ''}
                <button onclick="deleteNotification(${n.id});event.stopPropagation()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;opacity:0.5;" title="Delete">✕</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    });
    container.innerHTML = html;
  };

  window.markRead = function (id) {
    event.stopPropagation();
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.unread = false;
    updateBadge();
    renderNotifications();
  };

  window.markAllRead = function () {
    event.stopPropagation();
    notifications.forEach(n => n.unread = false);
    updateBadge();
    renderNotifications();
  };

  window.deleteNotification = function (id) {
    event.stopPropagation();
    notifications = notifications.filter(n => n.id !== id);
    updateBadge();
    renderNotifications();
  };

  window.clearAllNotifications = function () {
    event.stopPropagation();
    if (confirm('Clear all notifications? This cannot be undone.')) {
      notifications = [];
      updateBadge();
      renderNotifications();
    }
  };

  window.setNotifFilter = function (filter) {
    event.stopPropagation();
    notifFilter = filter;
    document.querySelectorAll('.notif-filter').forEach(btn => {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
    });
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.background = 'rgba(0,255,255,0.2)';
    }
    renderNotifications();
  };

  window.filterNotifications = function () {
    renderNotifications();
  };

  window.toggleNotifSound = function () {
    event.stopPropagation();
    notifSoundEnabled = !notifSoundEnabled;
    const btn = document.getElementById('sound-btn');
    btn.textContent = notifSoundEnabled ? '🔔' : '🔕';
    btn.style.opacity = notifSoundEnabled ? '1' : '0.5';
  };

  window.loadMoreNotifications = function () {
    event.stopPropagation();
  };

  function updateBadge() {
    const unreadCount = notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notif-badge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // User Menu
  window.toggleUserMenu = function () {
    const menu = document.getElementById('user-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  };

  window.handleLogout = function () {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('hootner_auth_token');
      localStorage.removeItem('hootner_user');
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  // Load username
  const userData = JSON.parse(localStorage.getItem('hootner_user') || '{}');
  if (userData.username) {
    document.getElementById('username-display').textContent = userData.username;
  }

  // Highlight active page
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === currentPath ||
      (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
      link.style.color = '#4ade80';
      link.style.fontWeight = '600';
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-dropdown') && !e.target.closest('button[onclick="toggleNotifications()"]')) {
      document.getElementById('notif-dropdown').style.display = 'none';
    }
    if (!e.target.closest('#user-menu') && !e.target.closest('button[onclick="toggleUserMenu()"]')) {
      document.getElementById('user-menu').style.display = 'none';
    }
  });

  updateBadge();
})();
