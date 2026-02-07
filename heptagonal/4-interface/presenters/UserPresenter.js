// User Presenter
import { UserViewModel } from '../viewmodels/UserViewModel.js';

export class UserPresenter {
  constructor(userService) {
    this.userService = userService;
  }

  // Present user profile
  async presentUserProfile(userId, currentUser) {
    const user = await this.userService.getUserById(userId);
    if (!user) return null;

    const viewModel = new UserViewModel(user);

    return {
      ...viewModel,
      isOwnProfile: currentUser?.id === userId,
      canFollow: currentUser && currentUser.id !== userId,
      canEdit: currentUser?.id === userId
    };
  }

  // Present current user
  async presentCurrentUser(userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) return null;

    return new UserViewModel(user);
  }

  // Present registration form
  presentRegistrationForm() {
    return {
      fields: ['email', 'username', 'password', 'displayName'],
      validation: {
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        username: { required: true, minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ },
        password: { required: true, minLength: 8 },
        displayName: { maxLength: 50 }
      }
    };
  }

  // Present login form
  presentLoginForm() {
    return {
      fields: ['email', 'password'],
      validation: {
        email: { required: true },
        password: { required: true }
      }
    };
  }

  // Present profile edit form
  async presentProfileEditForm(userId) {
    const user = await this.userService.getUserById(userId);
    if (!user) return null;

    return {
      currentData: {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar
      },
      validation: {
        username: { minLength: 3, maxLength: 20 },
        displayName: { maxLength: 50 },
        bio: { maxLength: 500 }
      }
    };
  }

  // Present followers list
  async presentFollowers(userId) {
    const followers = await this.userService.getFollowers(userId);
    return followers.map(user => new UserViewModel(user));
  }

  // Present following list
  async presentFollowing(userId) {
    const following = await this.userService.getFollowing(userId);
    return following.map(user => new UserViewModel(user));
  }
}

export default UserPresenter;
