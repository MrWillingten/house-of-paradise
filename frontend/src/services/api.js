import axios from 'axios';

// Get API URL at runtime - works even if environment variables are not set
const getApiBaseUrl = () => {
  // Check environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Runtime check based on current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not on localhost, we're in production - use Render API Gateway
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://hop-api-gateway.onrender.com';
    }
  }
  // Local development - use empty string (proxied through React dev server)
  return '';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to requests if available
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// FIXED: Add response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auto-logout for specific paths that should handle their own auth errors
    // Include auth paths to prevent page refresh on login/register errors
    const skipAutoLogoutPaths = ['/api/complete-booking', '/api/bookings', '/api/payments', '/api/auth'];
    const shouldSkipAutoLogout = skipAutoLogoutPaths.some(path =>
      originalRequest?.url?.includes(path)
    );

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token available
          // Only redirect to login if NOT on a skip path
          if (!shouldSkipAutoLogout) {
            localStorage.clear();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Call refresh endpoint (use same base URL as api instance)
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

        // Check if refresh was successful
        if (response.data?.data?.accessToken) {
          // Store new tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry the original request with new access token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        // Refresh failed
        console.error('Token refresh failed:', refreshError);

        // Only redirect to login if NOT on a skip path
        if (!shouldSkipAutoLogout) {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  verifyEmail: (data) => api.post('/api/auth/verify-email', data),
  resendCode: (data) => api.post('/api/auth/resend-code', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  verifyTwoFactorLogin: (data) => api.post('/api/auth/verify-2fa-login', data),
  // Account unlock (new flow - email verification)
  requestUnlock: (data) => api.post('/api/auth/request-unlock', data),
  verifyUnlock: (data) => api.post('/api/auth/verify-unlock', data),
  getProfile: () => api.get('/api/auth/profile'),
  verify: () => api.get('/api/auth/verify'),
  logout: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // FIXED: Call backend to blacklist tokens before clearing storage
      if (accessToken && refreshToken) {
        await api.post('/api/auth/logout',
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};

export const hotelService = {
  getAll: (params) => api.get('/api/hotels', { params }),
  getById: (id) => api.get(`/api/hotels/${id}`),
  create: (data) => api.post('/api/hotels', data),
  update: (id, data) => api.put(`/api/hotels/${id}`, data),
  delete: (id) => api.delete(`/api/hotels/${id}`),
};

export const tripService = {
  getAll: (params) => api.get('/api/trips', { params }),
  getById: (id) => api.get(`/api/trips/${id}`),
  create: (data) => api.post('/api/trips', data),
  update: (id, data) => api.put(`/api/trips/${id}`, data),
  delete: (id) => api.delete(`/api/trips/${id}`),
};

export const bookingService = {
  createHotelBooking: (data) => api.post('/api/bookings', data),
  createTripBooking: (data) => api.post('/api/bookings', data),
  getUserBookings: (userId) => api.get(`/api/bookings/user/${userId}`),
  updateBookingStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }),
};

export const paymentService = {
  createPayment: (data) => api.post('/api/payments', data),
  getPayment: (id) => api.get(`/api/payments/${id}`),
  getUserPayments: (userId) => api.get(`/api/payments/user/${userId}`),
  getByTransaction: (txId) => api.get(`/api/payments/transaction/${txId}`),
  refund: (id) => api.patch(`/api/payments/${id}/refund`),
};

export const completeBooking = (data) => api.post('/api/complete-booking', data);

// Admin Service
export const adminService = {
  // User Management
  getAllUsers: () => api.get('/api/admin/users'),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  promoteUser: (id) => api.patch(`/api/admin/users/${id}/role`, { role: 'moderator' }),
  demoteUser: (id) => api.patch(`/api/admin/users/${id}/role`, { role: 'user' }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  resetPassword: (id, password) => api.patch(`/api/admin/users/${id}/credentials`, { password }),
  updateUserCredentials: (id, data) => api.patch(`/api/admin/users/${id}/credentials`, data),

  // Stats
  getStats: () => api.get('/api/admin/stats'),

  // Analytics
  getAnalytics: (days = 7) => api.get('/api/admin/analytics', { params: { days } }),
};

export default api;