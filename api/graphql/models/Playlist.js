import { v4 as uuidv4 } from 'uuid';
import { GetCommand, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.js';

const VISIBILITY = ['PUBLIC', 'PRIVATE'];
const playlistKey = (playlistId) => ({ PK: `PLAYLIST#${playlistId}`, SK: 'META' });

function normalizePlaylist(item) {
  if (!item) return null;
  return {
    id: item.playlistId,
    playlistId: item.playlistId,
    name: item.name,
    description: item.description,
    userId: item.userId,
    videos: item.videos || [],
    visibility: item.visibility,
    thumbnail: item.thumbnail,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

async function createPlaylist({ name, description, userId, visibility = 'PUBLIC', thumbnail, videos = [] }) {
  const now = new Date().toISOString();
  const playlistId = uuidv4();
  const item = {
    ...playlistKey(playlistId),
    entityType: 'PLAYLIST',
    playlistId,
    name,
    description,
    userId,
    videos,
    visibility: VISIBILITY.includes(visibility) ? visibility : 'PUBLIC',
    thumbnail,
    createdAt: now,
    updatedAt: now
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return normalizePlaylist(item);
}

async function getPlaylistById(id) {
  const res = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: playlistKey(id) }));
  return normalizePlaylist(res.Item);
}

async function listPlaylists({ userId, limit = 20 } = {}) {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type',
    ExpressionAttributeNames: { '#type': 'entityType' },
    ExpressionAttributeValues: { ':type': 'PLAYLIST' }
  }));

  let items = (res.Items || []);
  if (userId) items = items.filter(p => p.userId === userId);
  else items = items.filter(p => p.visibility === 'PUBLIC');
  items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items.slice(0, limit).map(normalizePlaylist);
}

async function updatePlaylist(id, input, requesterId) {
  const current = await getPlaylistById(id);
  if (!current || current.userId !== requesterId) return null;

  const next = {
    ...current,
    ...input,
    visibility: input.visibility && VISIBILITY.includes(input.visibility) ? input.visibility : current.visibility,
    videos: input.videos || current.videos,
    updatedAt: new Date().toISOString()
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: { ...playlistKey(id), ...next, entityType: 'PLAYLIST' } }));
  return normalizePlaylist(next);
}

async function deletePlaylist(id, requesterId) {
  const current = await getPlaylistById(id);
  if (!current || current.userId !== requesterId) return false;
  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: playlistKey(id) }));
  return true;
}

async function addVideoToPlaylist(playlistId, videoId, requesterId) {
  const playlist = await getPlaylistById(playlistId);
  if (!playlist || playlist.userId !== requesterId) return null;
  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
  }
  playlist.updatedAt = new Date().toISOString();
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: { ...playlistKey(playlistId), ...playlist, entityType: 'PLAYLIST' } }));
  return normalizePlaylist(playlist);
}

async function removeVideoFromPlaylist(playlistId, videoId, requesterId) {
  const playlist = await getPlaylistById(playlistId);
  if (!playlist || playlist.userId !== requesterId) return null;
  playlist.videos = (playlist.videos || []).filter(v => v !== videoId);
  playlist.updatedAt = new Date().toISOString();
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: { ...playlistKey(playlistId), ...playlist, entityType: 'PLAYLIST' } }));
  return normalizePlaylist(playlist);
}

export { createPlaylist, getPlaylistById, listPlaylists, updatePlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist };
