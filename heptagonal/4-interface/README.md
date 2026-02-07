# Layer 4 - Interface

User interface components and presentation logic for the Hootner video platform.

## 🎆 Recent Updates

✅ **PWA Implementation** - Full Progressive Web App features
✅ **Dashboard Connectivity** - All HTML pages connected to dashboard
✅ **Node.js 22 Migration** - Updated from Node.js 20
✅ **Database Integration** - Connected to hexarchy DynamoDB
✅ **Mobile Optimization** - Touch-friendly responsive design

## 📱 PWA Features

✅ **Service Worker** - Offline caching and background sync
✅ **Web App Manifest** - Install prompts and app-like experience
✅ **HTTPS Support** - Secure connections via CloudFront
✅ **Responsive Design** - Mobile-first approach
✅ **Touch Optimization** - 44px minimum touch targets

## 📁 Structure

```
4-interface/
├── components/              # React UI Components
│   ├── VideoCard.jsx        # Video thumbnail card
│   ├── VideoPlayer.jsx      # Video player with controls
│   ├── VideoPlayerControls.jsx # Player controls UI
│   ├── CommentList.jsx      # Comment list with sorting
│   ├── CommentItem.jsx      # Individual comment with replies
│   ├── CommentForm.jsx      # Comment submission form
│   ├── PlaylistCard.jsx     # Playlist card component
│   ├── UserProfile.jsx      # User profile display
│   └── Navigation.jsx       # Site navigation header
├── viewmodels/              # View Models
│   ├── VideoViewModel.js    # Video data presentation model
│   ├── UserViewModel.js     # User data presentation model
│   ├── CommentViewModel.js  # Comment data presentation model
│   └── PlaylistViewModel.js # Playlist data presentation model
├── presenters/              # Presenters (Transform domain → view models)
│   ├── VideoPresenter.js    # Video presentation logic
│   ├── UserPresenter.js     # User presentation logic
│   ├── CommentPresenter.js  # Comment presentation logic
│   └── PlaylistPresenter.js # Playlist presentation logic
├── state/                   # State Management
│   └── UIState.jsx          # React Context global state
├── utils/                   # Utilities
│   ├── formatters.js        # Display formatters (duration, views, dates)
│   └── validation.js        # Form validation utilities
├── index.js                 # Central export
└── README.md                # This file
```

## 🎯 Purpose

Layer 4 provides user interface components and presentation logic:
- **React Components**: Reusable UI components for video platform features
- **View Models**: Data presentation models with display-specific business logic
- **Presenters**: Transform domain entities into view-friendly formats
- **State Management**: Global UI state using React Context
- **Utilities**: Formatters and validators for consistent UX

## 🧩 React Components

### VideoCard
Video thumbnail card component with metadata display:
- Thumbnail with duration overlay
- Title, author, views, date
- Like and comment counts
- Click handlers for video and author

### VideoPlayer
Full-featured video player:
- Play/pause, seek, volume controls
- Playback rate adjustment
- Fullscreen support
- Progress tracking callbacks
- Custom controls overlay

### VideoPlayerControls
Player control UI:
- Progress bar with seek
- Play/pause button
- Volume slider with mute
- Playback speed selector
- Fullscreen toggle

### CommentList
Comment section with features:
- Sort by newest, oldest, popular
- Top-level comments with nested replies
- Comment form for authenticated users
- Real-time comment addition

### CommentItem
Individual comment component:
- Author info with avatar
- Like, reply, edit, delete actions
- Threaded replies support
- Owner-only edit/delete
- Pinned comment badge

### CommentForm
Comment submission form:
- Textarea with character limit
- Submit/cancel buttons
- Reply-to support (parent comments)
- Loading state during submission

### PlaylistCard
Playlist card component:
- Thumbnail (from first video or custom)
- Title, description
- Video count overlay
- Public/private indicator
- Creator information

### UserProfile
User profile display:
- Avatar and username
- Display name and bio
- Follower/following stats
- Video count
- Follow/unfollow button
- Edit profile button (own profile)
- Verified badge

### Navigation
Site header navigation:
- Logo and branding
- Search bar
- Upload button
- Notifications icon
- User menu (profile, settings, logout)
- Login/signup (unauthenticated)

## 📊 View Models

### VideoViewModel
Video presentation model:
- Properties: id, title, description, url, thumbnail, duration, views, likes, category, status, author, commentCount
- Methods: `isPublished`, `isDraft`, `isProcessing`, `canBeEditedBy()`, `canBeDeletedBy()`, `incrementViews()`, `incrementLikes()`

### UserViewModel
User presentation model:
- Properties: id, email, username, displayName, avatar, bio, role, verified, followerCount, followingCount, isFollowing
- Methods: `isAdmin`, `isModerator`, `displayNameOrUsername`, `avatarUrl`, `canModerateContent()`, `canAccessAdminPanel()`

### CommentViewModel
Comment presentation model:
- Properties: id, text, videoId, userId, author, parentId, likes, isPinned, replyCount
- Methods: `isReply`, `isTopLevel`, `canBeEditedBy()`, `canBeDeletedBy()`, `canBePinnedBy()`, `incrementLikes()`, `pin()`, `unpin()`

### PlaylistViewModel
Playlist presentation model:
- Properties: id, title, description, userId, creator, videoIds, isPublic, thumbnail
- Methods: `videoCount`, `isEmpty`, `canBeEditedBy()`, `canBeDeletedBy()`, `canBeViewedBy()`, `addVideo()`, `removeVideo()`, `reorderVideos()`, `toggleVisibility()`

## 🎭 Presenters

### VideoPresenter
Transform video domain entities for UI:
- `presentVideo(videoId, currentUser)` - Single video with permissions
- `presentVideoList(filters, currentUser)` - Video list
- `presentTrendingVideos(limit)` - Trending videos
- `presentUserVideos(userId, currentUser)` - User's videos with permissions
- `presentUploadForm(currentUser)` - Upload form data (categories, limits)

### UserPresenter
Transform user domain entities for UI:
- `presentUserProfile(userId, currentUser)` - User profile with permissions
- `presentCurrentUser(userId)` - Current user data
- `presentRegistrationForm()` - Registration form metadata
- `presentLoginForm()` - Login form metadata
- `presentProfileEditForm(userId)` - Edit form with current data
- `presentFollowers(userId)` - Followers list
- `presentFollowing(userId)` - Following list

### CommentPresenter
Transform comment domain entities for UI:
- `presentVideoComments(videoId, currentUser)` - Comments with permissions
- `presentCommentReplies(commentId, currentUser)` - Nested replies
- `presentCommentForm(videoId, parentId, currentUser)` - Form metadata
- `presentCommentForEdit(commentId, currentUser)` - Comment for editing

### PlaylistPresenter
Transform playlist domain entities for UI:
- `presentPlaylist(playlistId, currentUser)` - Playlist with permissions
- `presentUserPlaylists(userId, currentUser)` - User's playlists (filtered by visibility)
- `presentPublicPlaylists(limit)` - Public playlists
- `presentPlaylistForm(currentUser)` - Creation form metadata
- `presentPlaylistForEdit(playlistId, currentUser)` - Playlist for editing

## 🔄 State Management

### UIState (React Context)
Global application state:

**State Structure:**
```javascript
{
  user: UserViewModel | null,
  isAuthenticated: boolean,
  videos: VideoViewModel[],
  currentVideo: VideoViewModel | null,
  playlists: PlaylistViewModel[],
  notifications: Notification[],
  unreadCount: number,
  theme: 'dark' | 'light',
  sidebarOpen: boolean,
  loading: boolean,
  error: Error | null
}
```

**Action Types:**
- Auth: `SET_USER`, `LOGOUT`
- Videos: `SET_VIDEOS`, `SET_CURRENT_VIDEO`, `UPDATE_VIDEO`, `DELETE_VIDEO`
- Playlists: `SET_PLAYLISTS`, `ADD_PLAYLIST`, `UPDATE_PLAYLIST`, `DELETE_PLAYLIST`
- Notifications: `SET_NOTIFICATIONS`, `ADD_NOTIFICATION`, `MARK_NOTIFICATION_READ`, `SET_UNREAD_COUNT`
- UI: `SET_THEME`, `TOGGLE_SIDEBAR`, `SET_LOADING`, `SET_ERROR`, `CLEAR_ERROR`

**Hooks:**
- `useUIState()` - Access state
- `useUIDispatch()` - Dispatch actions
- `useUI()` - Get both state and dispatch

## 🛠️ Utilities

### Formatters (`utils/formatters.js`)
Display formatting utilities:
- `formatDuration(seconds)` - Convert seconds to HH:MM:SS or MM:SS
- `formatViews(views)` - Format view count (1.2M, 45K, 123)
- `formatNumber(num)` - Add thousand separators (1,234,567)
- `formatDate(date)` - Relative dates ("2 hours ago", "3 days ago")
- `formatFileSize(bytes)` - Convert bytes to KB, MB, GB
- `formatCurrency(amount)` - Format as USD ($12.34)
- `formatPercentage(value, decimals)` - Format as percentage (45.2%)
- `truncateText(text, maxLength)` - Truncate with ellipsis

### Validation (`utils/validation.js`)
Form validation utilities:
- `validateEmail(email)` - Email format validation
- `validateUsername(username)` - Username rules (3-20 chars, alphanumeric + underscore)
- `validatePassword(password)` - Password strength (8+ chars, mixed case, numbers)
- `validateRequired(value, fieldName)` - Required field check
- `validateMinLength(value, minLength, fieldName)` - Minimum length
- `validateMaxLength(value, maxLength, fieldName)` - Maximum length
- `validateURL(url)` - URL format validation
- `validateFileSize(file, maxSize)` - File size limit
- `validateFileType(file, allowedTypes)` - File type whitelist
- `validateForm(formData, validationRules)` - Validate entire form

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 1 (Foundation) - Business logic via services
- Layer 3 (Communication) - API calls for data fetching

**Provides:**
- UI components for React applications
- View models for data presentation
- Form validation and display formatting
- Global state management

## 📚 Usage Examples

### Using Components
```jsx
import { VideoCard, VideoPlayer, CommentList, Navigation } from './hexarchy/4-interface/index.js';

function App() {
  return (
    <>
      <Navigation currentUser={user} onLogout={handleLogout} onSearch={handleSearch} />
      <VideoPlayer video={video} onProgress={handleProgress} />
      <CommentList 
        videoId={video.id} 
        comments={comments}
        currentUser={user}
        onAddComment={handleAddComment}
      />
    </>
  );
}
```

### Using Presenters
```javascript
import { VideoPresenter, UserPresenter } from './hexarchy/4-interface/index.js';

const videoPresenter = new VideoPresenter(videoService);
const videoData = await videoPresenter.presentVideo(videoId, currentUser);

const userPresenter = new UserPresenter(userService);
const profileData = await userPresenter.presentUserProfile(userId, currentUser);
```

### Using State Management
```jsx
import { UIStateProvider, useUI, ActionTypes } from './hexarchy/4-interface/index.js';

function App() {
  return (
    <UIStateProvider>
      <VideoPage />
    </UIStateProvider>
  );
}

function VideoPage() {
  const [state, dispatch] = useUI();
  
  const setVideo = (video) => {
    dispatch({ type: ActionTypes.SET_CURRENT_VIDEO, payload: video });
  };
  
  return <div>{state.currentVideo?.title}</div>;
}
```

### Using Utilities
```javascript
import { formatDuration, formatViews, validateForm } from './hexarchy/4-interface/index.js';

// Formatting
const duration = formatDuration(3665); // "1:01:05"
const views = formatViews(1250000); // "1.3M"

// Validation
const { isValid, errors } = validateForm(formData, {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  username: { required: true, minLength: 3, maxLength: 20 },
  password: { required: true, minLength: 8 }
});
```

## ✅ Complete

Layer 4 (Interface) is **100% complete** with:
- ✅ 9 React components (VideoCard, VideoPlayer, Comments, Playlists, User Profile, Navigation)
- ✅ 4 view models (Video, User, Comment, Playlist)
- ✅ 4 presenters (Video, User, Comment, Playlist)
- ✅ 1 state management system (React Context with hooks)
- ✅ 2 utility modules (formatters, validation)
- ✅ Central export file

**Total: 20+ files** providing comprehensive UI infrastructure for the Hootner video platform.
