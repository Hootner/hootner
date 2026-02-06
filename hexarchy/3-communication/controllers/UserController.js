// User Controller (REST API)
import { UserService } from '../../1-foundation/services/UserService.js';
import { AuthService } from '../../1-foundation/services/AuthService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { userSchemas, validate } from '../../0-core/schemas/validation.js';
import { authenticate, requireRole } from '../../0-core/auth/middleware.js';

const userService = new UserService();
const authService = new AuthService();

export class UserController {
  // POST /api/users/register
  static register = asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(
      req.body,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), token }
    });
  });

  // POST /api/users/login
  static login = asyncHandler(async (req, res) => {
    const { user, token } = await authService.login(
      req.body.email,
      req.body.password,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      success: true,
      data: { user: user.toJSON(), token }
    });
  });

  // POST /api/users/logout
  static logout = [
    authenticate,
    asyncHandler(async (req, res) => {
      await authService.logout(req.user.id, req.ip, req.get('user-agent'));
      res.json({ success: true, message: 'Logged out successfully' });
    })
  ];

  // GET /api/users/me
  static getProfile = [
    authenticate,
    asyncHandler(async (req, res) => {
      const user = await userService.getUserById(req.user.id);
      res.json({ success: true, data: user.toJSON() });
    })
  ];

  // GET /api/users/:id
  static getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user.toPublicProfile() });
  });

  // PUT /api/users/me
  static updateProfile = [
    authenticate,
    validate(userSchemas.update),
    asyncHandler(async (req, res) => {
      const updated = await userService.updateUser(
        req.user.id,
        req.body,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );
      res.json({ success: true, data: updated });
    })
  ];

  // POST /api/users/password
  static changePassword = [
    authenticate,
    asyncHandler(async (req, res) => {
      await userService.changePassword(
        req.user.id,
        req.body.oldPassword,
        req.body.newPassword,
        req.ip,
        req.get('user-agent')
      );
      res.json({ success: true, message: 'Password changed successfully' });
    })
  ];

  // POST /api/users/verify
  static verifyUser = [
    authenticate,
    requireRole(['admin', 'super_admin']),
    asyncHandler(async (req, res) => {
      await userService.verifyUser(req.params.id);
      res.json({ success: true, message: 'User verified' });
    })
  ];

  // DELETE /api/users/:id
  static deleteUser = [
    authenticate,
    requireRole(['admin', 'super_admin']),
    asyncHandler(async (req, res) => {
      await userService.deleteUser(
        req.params.id,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );
      res.json({ success: true, message: 'User deleted' });
    })
  ];
}

export default UserController;
