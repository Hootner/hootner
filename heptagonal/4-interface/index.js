// Layer 4 Interface - Central Export
// User interface components, view models, presenters, and state management

// React Components
export { VideoCard } from './components/VideoCard.jsx';
export { VideoPlayer } from './components/VideoPlayer.jsx';
export { VideoPlayerControls } from './components/VideoPlayerControls.jsx';
export { CommentList } from './components/CommentList.jsx';
export { CommentItem } from './components/CommentItem.jsx';
export { CommentForm } from './components/CommentForm.jsx';
export { PlaylistCard } from './components/PlaylistCard.jsx';
export { UserProfile } from './components/UserProfile.jsx';
export { Navigation } from './components/Navigation.jsx';

// View Models
export { VideoViewModel } from './viewmodels/VideoViewModel.js';
export { UserViewModel } from './viewmodels/UserViewModel.js';
export { CommentViewModel } from './viewmodels/CommentViewModel.js';
export { PlaylistViewModel } from './viewmodels/PlaylistViewModel.js';

// Presenters
export { VideoPresenter } from './presenters/VideoPresenter.js';
export { UserPresenter } from './presenters/UserPresenter.js';
export { CommentPresenter } from './presenters/CommentPresenter.js';
export { PlaylistPresenter } from './presenters/PlaylistPresenter.js';

// State Management
export {
  UIStateProvider,
  useUIState,
  useUIDispatch,
  useUI,
  ActionTypes
} from './state/UIState.jsx';

// Utilities
export {
  formatDuration,
  formatViews,
  formatNumber,
  formatDate,
  formatFileSize,
  formatCurrency,
  formatPercentage,
  truncateText
} from './utils/formatters.js';

export {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateURL,
  validateFileSize,
  validateFileType,
  validateForm
} from './utils/validation.js';

/**
 * Layer 4 - Interface
 *
 * Purpose: User interface components and presentation logic
 *
 * Components:
 * - React Components: Reusable UI components for video player, comments, playlists, user profiles
 * - View Models: Data presentation models with business logic for display
 * - Presenters: Transform domain data into view models for UI consumption
 * - State Management: React Context-based global state
 * - Utilities: Formatters and validation helpers
 *
 * Layer Dependencies:
 * - Depends on: Layer 1 (Foundation) for business logic via services
 * - Uses: Layer 3 (Communication) for API calls
 * - Provides: UI components for web applications
 */
