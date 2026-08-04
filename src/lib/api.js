const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Standard fetch helper with JWT token support
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API Request Failed');
    }

    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // Auth API
  auth: {
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
    getProfile: () => apiRequest('/auth/me', 'GET'),
  },

  // Students API
  students: {
    getAll: (search = '') => apiRequest(`/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getById: (id) => apiRequest(`/students/${id}`),
    getProfile: (id) => apiRequest(`/students/${id}/profile`),
    create: (data) => apiRequest('/students', 'POST', data),
    update: (id, data) => apiRequest(`/students/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/students/${id}`, 'DELETE'),
  },

  // Teachers API
  teachers: {
    getAll: (search = '') => apiRequest(`/teachers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getById: (id) => apiRequest(`/teachers/${id}`),
    create: (data) => apiRequest('/teachers', 'POST', data),
    update: (id, data) => apiRequest(`/teachers/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/teachers/${id}`, 'DELETE'),
  },

  // Courses API
  courses: {
    getAll: (search = '') => apiRequest(`/courses${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getById: (id) => apiRequest(`/courses/${id}`),
    create: (data) => apiRequest('/courses', 'POST', data),
    update: (id, data) => apiRequest(`/courses/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/courses/${id}`, 'DELETE'),
  },

  // Enrollments API
  enrollments: {
    getAll: () => apiRequest('/enrollments'),
    create: (data) => apiRequest('/enrollments', 'POST', data),
    delete: (id) => apiRequest(`/enrollments/${id}`, 'DELETE'),
  },

  // Attendance API
  attendance: {
    getAll: (date = '') => apiRequest(`/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`),
    getStats: () => apiRequest('/attendance/stats'),
    mark: (data) => apiRequest('/attendance', 'POST', data),
    bulkMark: (data) => apiRequest('/attendance/bulk', 'POST', data),
  },

  // Dashboard API
  dashboard: {
    getStats: () => apiRequest('/dashboard/stats'),
  },

  // Fees API
  fees: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/fees${query ? `?${query}` : ''}`);
    },
    getStats: () => apiRequest('/fees/stats'),
    getStudentProfile: (studentId) => apiRequest(`/fees/student/${studentId}`),
    generate: (data = {}) => apiRequest('/fees/generate', 'POST', data),
    pay: (feeId, data) => apiRequest(`/fees/${feeId}/pay`, 'POST', data),
    updateTuition: (studentId, monthlyTuitionFee) =>
      apiRequest(`/fees/student/${studentId}/tuition`, 'PUT', { monthlyTuitionFee }),
  },
};
