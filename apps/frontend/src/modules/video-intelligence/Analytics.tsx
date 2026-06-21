import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { TrendUp, VideoCamera, Clock, Eye, ChartBar } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import PresenceIndicator from '@/modules/video-intelligence/PresenceIndicator'
import type { Video } from '@/shared/lib/types'

export default function Analytics() {
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])

  const safeVideos = videos || []
  
  const totalVideos = safeVideos.length
  const totalViews = safeVideos.reduce((sum, v) => sum + v.views, 0)
  const totalDuration = safeVideos.reduce((sum, v) => sum + v.duration, 0)
  const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0

  const viewsOverTime = safeVideos
    .sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime())
    .map((video) => ({
      date: new Date(video.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: video.views,
      title: video.title
    }))

  const topVideos = [...safeVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((v) => ({
      title: v.title.length > 20 ? v.title.substring(0, 20) + '...' : v.title,
      views: v.views
    }))

  const sentimentData = safeVideos.reduce((acc, video) => {
    if (video.aiInsights?.sentiment) {
      acc[video.aiInsights.sentiment] = (acc[video.aiInsights.sentiment] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const sentimentChartData = Object.entries(sentimentData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  const COLORS = {
    positive: 'oklch(0.7 0.15 145)',
    neutral: 'oklch(0.65 0.03 250)',
    negative: 'oklch(0.55 0.22 25)'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="bg-card border-border hover:border-accent/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon weight="bold" className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendUp weight="bold" className="w-3 h-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track performance and insights across your video library
          </p>
        </div>
        <PresenceIndicator />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Videos"
          value={totalVideos}
          icon={VideoCamera}
          trend={totalVideos > 0 ? `${totalVideos} uploaded` : 'No videos yet'}
          color="text-accent"
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          trend={avgViewsPerVideo > 0 ? `${avgViewsPerVideo} avg per video` : 'No views yet'}
          color="text-accent"
        />
        <StatCard
          title="Total Duration"
          value={formatDuration(totalDuration)}
          icon={Clock}
          trend={totalVideos > 0 ? `${Math.round(totalDuration / totalVideos)}s avg` : 'No content yet'}
          color="text-accent"
        />
        <StatCard
          title="AI Analyzed"
          value={safeVideos.filter(v => v.aiInsights).length}
          icon={ChartBar}
          trend={totalVideos > 0 ? `${Math.round((safeVideos.filter(v => v.aiInsights).length / totalVideos) * 100)}% coverage` : 'Upload videos'}
          color="text-accent"
        />
      </motion.div>

      {totalVideos > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Video view accumulation by upload date</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.04 250)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="oklch(0.65 0.03 250)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="oklch(0.65 0.03 250)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.22 0.05 250)',
                      border: '1px solid oklch(0.30 0.04 250)',
                      borderRadius: '8px',
                      color: 'oklch(0.98 0 0)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="oklch(0.75 0.18 195)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.75 0.18 195)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {topVideos.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top Videos by Views</CardTitle>
                <CardDescription>Most viewed content in your library</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topVideos} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.04 250)" />
                    <XAxis 
                      type="number"
                      stroke="oklch(0.65 0.03 250)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      dataKey="title" 
                      type="category"
                      stroke="oklch(0.65 0.03 250)"
                      style={{ fontSize: '11px' }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.22 0.05 250)',
                        border: '1px solid oklch(0.30 0.04 250)',
                        borderRadius: '8px',
                        color: 'oklch(0.98 0 0)'
                      }}
                    />
                    <Bar 
                      dataKey="views" 
                      fill="oklch(0.75 0.18 195)"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {sentimentChartData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Content Sentiment</CardTitle>
                <CardDescription>AI-analyzed sentiment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || 'oklch(0.65 0.03 250)'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.22 0.05 250)',
                        border: '1px solid oklch(0.30 0.04 250)',
                        borderRadius: '8px',
                        color: 'oklch(0.98 0 0)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Insights Summary</CardTitle>
              <CardDescription>Key metrics and observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Viewed</span>
                  <span className="text-sm font-semibold">
                    {topVideos.length > 0 ? topVideos[0].title : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Video Length</span>
                  <span className="text-sm font-mono font-semibold">
                    {totalVideos > 0 ? formatDuration(Math.round(totalDuration / totalVideos)) : '0m'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Content with AI Tags</span>
                  <span className="text-sm font-mono font-semibold">
                    {safeVideos.filter(v => v.aiInsights?.tags && v.aiInsights.tags.length > 0).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ChartBar className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Upload some videos to start seeing analytics and insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
