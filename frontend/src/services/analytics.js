import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Student Analytics
export const getStudentAnalytics = async (rollNo) => {
  const response = await axios.get(`${API_URL}/api/analytics/student/${rollNo}`);
  return response.data;
};

// Class/Subject Analytics
export const getClassAnalytics = async (className, section = '') => {
  const params = section ? `?section=${encodeURIComponent(section)}` : '';
  const response = await axios.get(`${API_URL}/api/analytics/class/${encodeURIComponent(className)}${params}`);
  return response.data;
};

// Subject Analytics
export const getSubjectAnalytics = async (subject, className) => {
  const response = await axios.get(
    `${API_URL}/api/analytics/subject/${encodeURIComponent(subject)}/${encodeURIComponent(className)}`
  );
  return response.data;
};

// Dashboard Analytics
export const getDashboardAnalytics = async (className) => {
  const response = await axios.get(`${API_URL}/api/analytics/dashboard/${encodeURIComponent(className)}`);
  return response.data;
};

const analyticsService = {
  getStudentAnalytics,
  getClassAnalytics,
  getSubjectAnalytics,
  getDashboardAnalytics
};

export default analyticsService;
