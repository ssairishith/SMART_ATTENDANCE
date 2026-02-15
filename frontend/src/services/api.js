import axios from 'axios';

// Use current hostname for API (localhost on PC, IP address on Mobile)
const API_BASE_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5050`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Teacher auth
export const loginTeacher = (formData) => {
  return api.post('/api/teacher/login', formData);
};

export const registerTeacher = (data) => {
  return api.post('/api/teacher/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getTeacherDashboardData = (facultyId) => {
  return api.get(`/api/teacher/dashboard-data/${facultyId}`);
};

export const getDailyAttendanceSummary = (data) => {
  return api.post('/api/teacher/daily-attendance-summary', data);
};

export const getStudentAttendanceReport = (facultyId, filters = {}) => {
  return api.post('/api/teacher/attendance-report', { facultyId, ...filters });
};

// Student
export const registerStudent = (formData) => {
  return api.post('/api/student/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getStudentsBySection = (section) => {
  return api.get(`/api/student/list/${section}`);
};

// Attendance
export const takeLiveAttendance = (formData) => {
  return api.post('/api/attendance/live', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const takeGroupAttendance = (formData) => {
  return api.post('/api/attendance/group', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadReport = (filename) => {
  return api.get(`/api/attendance/download/${filename}`, {
    responseType: 'blob',
  });
};

export const storeExcel = (formData) => {
  return api.post('/api/attendance/store-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const listExcelFiles = () => {
  return api.get('/api/attendance/list-files');
};

export const deleteReport = (filename) => {
  return api.delete(`/api/attendance/delete/${filename}`);
};

export const recognizeFrame = (formData) => {
  return api.post('/api/recognition/frame', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// HOD Auth
export const loginHOD = (formData) => {
  return api.post('/api/hod/login', formData);
};

export const registerHOD = (data) => {
  return api.post('/api/hod/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// HOD Dashboard Data
export const getHODDashboardData = () => {
  return api.get('/api/hod/dashboard-data');
};

export const getBranches = () => {
  return api.get('/api/hod/branches');
};

export const getBranchAttendance = (branchId) => {
  return api.get(`/api/hod/branch/${branchId}/attendance`);
};

export const getSectionStudents = (branchId, section) => {
  return api.get(`/api/hod/branch/${branchId}/section/${section}/students`);
};

export const getHODAttendanceHistory = () => {
  return api.get('/api/hod/attendance-history');
};

// Manual Attendance Override
export const submitManualOverride = (data) => {
  return api.post('/api/attendance/manual-override', data);
};

export const getManualLogs = (params) => {
  return api.get('/api/attendance/manual-logs', { params });
};

export const getManualLogsHOD = (params) => {
  return api.get('/api/attendance/manual-logs/hod', { params });
};

export const getAttendanceWithManualInfo = (date, className) => {
  return api.get('/api/attendance/with-manual-info', { params: { date, className } });
};

export default api;