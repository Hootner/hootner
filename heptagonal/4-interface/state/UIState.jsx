// UI State Management (using React Context pattern)
import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  videos: [],
  currentVideo: null,
  playlists: [],
  notifications: [],
  unreadCount: 0,
  theme: 'dark',
  sidebarOpen: true,
  loading: false,
  error: null
};

// Action types
export const ActionTypes = {
  // Auth
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',

  // Videos
  SET_VIDEOS: 'SET_VIDEOS',
  SET_CURRENT_VIDEO: 'SET_CURRENT_VIDEO',
  UPDATE_VIDEO: 'UPDATE_VIDEO',
  DELETE_VIDEO: 'DELETE_VIDEO',

  // Playlists
  SET_PLAYLISTS: 'SET_PLAYLISTS',
  ADD_PLAYLIST: 'ADD_PLAYLIST',
  UPDATE_PLAYLIST: 'UPDATE_PLAYLIST',
  DELETE_PLAYLIST: 'DELETE_PLAYLIST',

  // Notifications
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',

  // UI
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function uiReducer(state, action) {
  switch (action.type) {
    // Auth
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };

    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };

    // Videos
    case ActionTypes.SET_VIDEOS:
      return {
        ...state,
        videos: action.payload
      };

    case ActionTypes.SET_CURRENT_VIDEO:
      return {
        ...state,
        currentVideo: action.payload
      };

    case ActionTypes.UPDATE_VIDEO:
      return {
        ...state,
        videos: state.videos.map(v =>
          v.id === action.payload.id ? action.payload : v
        ),
        currentVideo: state.currentVideo?.id === action.payload.id
          ? action.payload
          : state.currentVideo
      };

    case ActionTypes.DELETE_VIDEO:
      return {
        ...state,
        videos: state.videos.filter(v => v.id !== action.payload),
        currentVideo: state.currentVideo?.id === action.payload
          ? null
          : state.currentVideo
      };

    // Playlists
    case ActionTypes.SET_PLAYLISTS:
      return {
        ...state,
        playlists: action.payload
      };

    case ActionTypes.ADD_PLAYLIST:
      return {
        ...state,
        playlists: [...state.playlists, action.payload]
      };

    case ActionTypes.UPDATE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };

    case ActionTypes.DELETE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.payload)
      };

    // Notifications
    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case ActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };

    // UI
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };

    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Context
const UIStateContext = createContext();
const UIDispatchContext = createContext();

// Provider
export function UIStateProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIStateContext.Provider value={state}>
      <UIDispatchContext.Provider value={dispatch}>
        {children}
      </UIDispatchContext.Provider>
    </UIStateContext.Provider>
  );
}

// Hooks
export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider');
  }
  return context;
}

export function useUIDispatch() {
  const context = useContext(UIDispatchContext);
  if (!context) {
    throw new Error('useUIDispatch must be used within UIStateProvider');
  }
  return context;
}

// Combined hook
export function useUI() {
  return [useUIState(), useUIDispatch()];
}
