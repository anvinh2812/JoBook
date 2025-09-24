// src/services/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = __API_BASE_URL__; // <-- lấy từ vite.config.js

const api = axios.create({
  baseURL: API_BASE_URL,
});


// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
  toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

// Posts API
export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

// CVs API
export const cvsAPI = {
  getCVs: () => api.get('/cvs'),
  uploadCV: (formData) => api.post('/cvs/upload', formData),
  toggleCV: (id) => api.patch(`/cvs/${id}/toggle`),
  deleteCV: (id) => api.delete(`/cvs/${id}`),
  getCVFile: (id) => api.get(`/cvs/${id}/file`, { responseType: 'blob' }),
  renameCV: (id, name) => api.patch(`/cvs/${id}/name`, { name }),
};

// Applications API
export const applicationsAPI = {
  apply: (applicationData) => api.post('/applications', applicationData),
  getMyApplications: () => api.get('/applications/my-applications'),
  getReceivedApplications: () => api.get('/applications/received'),
  getPostApplications: (postId) => api.get(`/applications/post/${postId}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
};

// Follows API
export const followsAPI = {
  follow: (userId) => api.post(`/follows/${userId}`),
  unfollow: (userId) => api.delete(`/follows/${userId}`),
  getFollowers: () => api.get('/follows/followers'),
  getFollowing: () => api.get('/follows/following'),
  getFollowStatus: (userId) => api.get(`/follows/status/${userId}`),
  getFollowCounts: (userId) => api.get(`/follows/counts/${userId}`),
  // By specific userId (for viewing other profiles)
  getFollowersByUser: (userId) => api.get(`/follows/${userId}/followers`),
  getFollowingByUser: (userId) => api.get(`/follows/${userId}/following`),
};

// Users API
export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  updateProfile: (profileData) => api.patch('/users/profile', profileData),
  uploadAvatar: (formData) => api.post('/users/avatar', formData),
  searchUsers: (params) => api.get('/users', { params }),
};

// Companies API (admin management + public lookup)
export const companiesAPI = {
  list: (params) => api.get('/companies', { params }),
  review: (id, payload) => api.patch(`/companies/${id}/review`, payload),
  byTax: (taxCode) => api.get(`/companies/by-tax/${taxCode}`),
  create: (payload) => api.post('/companies', payload),
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, payload) => api.patch(`/companies/${id}`, payload),
  remove: (id) => api.delete(`/companies/${id}`),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/companies/upload-logo', formData);
  },
};

// Recommendations API
export const recommendationsAPI = {
  get: (cvId) => api.get('/recommendations', { params: { cvId } }),
};

export default api;
