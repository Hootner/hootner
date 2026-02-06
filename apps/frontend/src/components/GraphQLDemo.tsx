import { useQuery } from '@apollo/client'
import { GET_ANALYTICS, GET_USERS, GET_VIDEOS } from '../graphql/queries'

export function GraphQLDemo() {
  const { data: analyticsData, loading: analyticsLoading } = useQuery(GET_ANALYTICS)
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS)
  const { data: videosData, loading: videosLoading } = useQuery(GET_VIDEOS)

  return (
    <div className="graphql-demo p-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">🚀 Live GraphQL API Data</h2>

      {/* Analytics */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
        {analyticsLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600 p-4 rounded">
              <div className="text-2xl font-bold">
                {analyticsData?.analytics.totalUsers}
              </div>
              <div className="text-sm">Total Users</div>
            </div>
            <div className="bg-green-600 p-4 rounded">
              <div className="text-2xl font-bold">
                {analyticsData?.analytics.totalVideos}
              </div>
              <div className="text-sm">Total Videos</div>
            </div>
            <div className="bg-yellow-600 p-4 rounded">
              <div className="text-2xl font-bold">
                ${analyticsData?.analytics.revenue}
              </div>
              <div className="text-sm">Revenue</div>
            </div>
            <div className="bg-purple-600 p-4 rounded">
              <div className="text-2xl font-bold">
                {analyticsData?.analytics.activeStreams}
              </div>
              <div className="text-sm">Active Streams</div>
            </div>
          </div>
        )}
      </div>

      {/* Users */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">👥 Users</h3>
        {usersLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-gray-800 p-4 rounded">
            {usersData?.users.map((user: any) => (
              <div key={user.id} className="mb-2">
                <span className="font-semibold">{user.name}</span> - {user.email} -{' '}
                {user.subscription}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      <div>
        <h3 className="text-xl font-semibold mb-2">🎥 Videos</h3>
        {videosLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-gray-800 p-4 rounded">
            {videosData?.videos.map((video: any) => (
              <div key={video.id} className="mb-2">
                <span className="font-semibold">{video.title}</span> - Status:{' '}
                {video.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
