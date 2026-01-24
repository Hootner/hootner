// Domain Events
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

// User Events
export const USER_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_DELETED: 'user.deleted',
  PASSWORD_CHANGED: 'user.password_changed',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout'
};

export const emitUserRegistered = (user) => {
  eventEmitter.emit(USER_EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: user.email,
    username: user.username,
    timestamp: new Date().toISOString()
  });
};

export const emitUserVerified = (userId) => {
  eventEmitter.emit(USER_EVENTS.USER_VERIFIED, {
    userId,
    timestamp: new Date().toISOString()
  });
};

export const emitPasswordChanged = (userId) => {
  eventEmitter.emit(USER_EVENTS.PASSWORD_CHANGED, {
    userId,
    timestamp: new Date().toISOString()
  });
};

export const onUserEvent = (event, handler) => {
  eventEmitter.on(event, handler);
};

export default {
  USER_EVENTS,
  emitUserRegistered,
  emitUserVerified,
  emitPasswordChanged,
  onUserEvent
};
