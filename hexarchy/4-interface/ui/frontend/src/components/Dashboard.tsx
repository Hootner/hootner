import { useState } from 'react';
import type { ReactNode } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const stats = {
    posts: 127,
    users: 1234,
    engagement: 89,
    revenue: 12400
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-green-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-black/20 backdrop-blur-lg rounded-lg p-2">
          {['overview', 'analytics', 'moderation', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white' 
                  : 'text-cyan-400 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Posts" value={stats.posts} trend="+12%" />
              <StatCard title="Active Users" value={stats.users.toLocaleString()} trend="+8%" />
              <StatCard title="Engagement" value={`${stats.engagement}%`} trend="-2%" />
              <StatCard title="Revenue" value={`$${(stats.revenue/1000).toFixed(1)}K`} trend="+24%" />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActionCard />
              <ActivityCard />
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Views" value="45,231" />
              <StatCard title="Avg. Watch Time" value="4.2m" />
              <StatCard title="Conversion Rate" value="3.8%" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
};

const StatCard = ({ title, value, trend }: StatCardProps) => (
  <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6 hover:border-green-400/40 transition-all">
    <h3 className="text-cyan-400 text-sm mb-2">{title}</h3>
    <p className="text-2xl font-bold text-green-400 mb-2">{value}</p>
    {trend && (
      <div className={`text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        {trend} this week
      </div>
    )}
  </div>
);

const ActionCard = () => (
  <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-green-400">Quick Actions</h2>
    <div className="space-y-3">
      <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
        📝 Create New Post
      </button>
      <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
        💻 Open Code Editor
      </button>
      <button className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
        💬 Messages
      </button>
    </div>
  </div>
);

const ActivityCard = () => (
  <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-green-400">🔥 Live Activity (Real-time)</h2>
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
  <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-green-400">{title}</h2>
    <div className="h-64">{chart}</div>
  </div>
);

const ModerationPanel = () => (
  <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-green-400">Content Moderation</h2>
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
  <div className="space-y-6">
    <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-green-400">System Health</h2>
      <div className="space-y-3">
        <ServiceStatus name="API Gateway" status="healthy" uptime="99.9%" />
        <ServiceStatus name="Auth Service" status="healthy" uptime="100%" />
        <ServiceStatus name="Video Processing" status="warning" uptime="High load" />
        <ServiceStatus name="Database" status="healthy" uptime="Optimal" />
      </div>
    </div>
    
    <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-green-400">Resource Usage</h2>
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