import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_PLAYLISTS = gql`
  query GetMyPlaylists {
    myPlaylists {
      id
      name
      description
      videoCount
      thumbnail
      createdAt
    }
  }
`

const CREATE_PLAYLIST = gql`
  mutation CreatePlaylist($input: PlaylistInput!) {
    createPlaylist(input: $input) {
      id
      name
      description
    }
  }
`

const DELETE_PLAYLIST = gql`
  mutation DeletePlaylist($id: ID!) {
    deletePlaylist(id: $id)
  }
`

interface Playlist {
  id: string
  name: string
  description?: string
  videoCount: number
  thumbnail?: string
  createdAt: string
}

export const PlaylistManager = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data, loading, refetch } = useQuery<{ myPlaylists: Playlist[] }>(
    GET_PLAYLISTS
  )
  const [createPlaylist] = useMutation(CREATE_PLAYLIST, {
    onCompleted: () => {
      setShowCreate(false)
      setName('')
      setDescription('')
      refetch()
    },
  })
  const [deletePlaylist] = useMutation(DELETE_PLAYLIST, {
    onCompleted: () => refetch(),
  })

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    await createPlaylist({ variables: { input: { name, description } } })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this playlist?')) {
      await deletePlaylist({ variables: { id } })
    }
  }

  if (loading) return <div className="text-center p-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Playlist
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-gray-100 p-4 rounded mb-6">
          <input
            type="text"
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
            rows={3}
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.myPlaylists.map((playlist) => (
          <div key={playlist.id} className="bg-white rounded-lg shadow p-4">
            {playlist.thumbnail && (
              <img
                src={playlist.thumbnail}
                alt={playlist.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-gray-600 text-sm mb-2">{playlist.description}</p>
            )}
            <p className="text-gray-500 text-sm mb-3">{playlist.videoCount} videos</p>
            <button
              onClick={() => handleDelete(playlist.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
