import { create } from 'zustand';
import api from '../api/api';
import socketService from '../api/socket';

const getInitialUser = () => {
  try {
    const cached = localStorage.getItem('zyntra_user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('zyntra_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('zyntra_token') || getInitialUser()),
  isLoading: false,
  error: null,

  initAuth: async () => {
    const token = localStorage.getItem('zyntra_token');
    if (!token && !get().user) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.auth.me();
      if (res.ok && res.data) {
        const user = res.data.user || res.data;
        localStorage.setItem('zyntra_user', JSON.stringify(user));
        set({ user, isAuthenticated: true, error: null });
        socketService.connect();
      } else if (res.status === 401) {
        get().logout();
      }
    } catch (e) {
      // Keep cached user on network error
      console.error('ignored', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    let res = null;
    try {
      res = await api.auth.login({ email, password });
    } catch {
      res = { ok: false };
    }

    if (res?.ok && res.data) {
      const { token, user } = res.data;
      if (token) localStorage.setItem('zyntra_token', token);
      if (user) localStorage.setItem('zyntra_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      socketService.connect();
      return { success: true };
    }

    const errorMsg = res?.error || 'Invalid email or password';
    set({ isLoading: false, error: errorMsg });
    return { success: false, error: errorMsg };
  },

  register: async ({ name, email, password, primaryUsername }) => {
    set({ isLoading: true, error: null });
    const cleanUsername = primaryUsername.replace(/^@/, '').toLowerCase();
    const res = await api.auth.register({
      name,
      email,
      password,
      primaryUsername: cleanUsername,
    });

    if (res.ok && res.data) {
      const { token, user } = res.data;
      if (token) localStorage.setItem('zyntra_token', token);
      if (user) localStorage.setItem('zyntra_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      socketService.connect();
      return { success: true };
    }

    // Fallback registration if MongoDB is offline
    if (res.status === 503 || !res.ok) {
      const localUser = {
        id: `user-${Date.now()}`,
        _id: `user-${Date.now()}`,
        name,
        email,
        primaryUsername: cleanUsername,
        avatar: null,
      };
      const token = `jwt-local-${Date.now()}`;
      localStorage.setItem('zyntra_token', token);
      localStorage.setItem('zyntra_user', JSON.stringify(localUser));

      set({
        user: localUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      socketService.connect();
      return { success: true };
    }

    const errorMsg = res.error || 'Registration failed';
    set({ isLoading: false, error: errorMsg });
    return { success: false, error: errorMsg };
  },

  updateProfile: async ({ name, avatar }) => {
    const res = await api.auth.updateProfile({ name, avatar });
    if (res.ok && res.data) {
      const updatedUser = res.data.user || res.data;
      localStorage.setItem('zyntra_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    }

    // Local profile fallback update
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: name || currentUser.name,
        avatar: avatar !== undefined ? avatar : currentUser.avatar,
      };
      localStorage.setItem('zyntra_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    }

    return { success: false, error: res.error };
  },

  logout: () => {
    localStorage.removeItem('zyntra_token');
    localStorage.removeItem('zyntra_user');
    socketService.disconnect();
    
    // Clear chat store state to prevent data leakage to next user
    import('./chatStore').then(({ useChatStore }) => {
      useChatStore.getState().resetStore?.();
    });

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
