import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import TeacherOptions from './components/TeacherOptions';
import TeacherRegister from './components/TeacherRegister';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import LiveAttendance from './components/LiveAttendance';
import GroupAttendance from './components/GroupAttendance';
import Reports from './components/Reports';
import PublicStudentRegistration from './components/PublicStudentRegistration';
// HOD Components
import StudentList from './components/StudentList';
import HODOptions from './components/HODOptions';
import HODLogin from './components/HODLogin';
import HODRegister from './components/HODRegister';
import HODDashboard from './components/hod/HODDashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Faculty Routes */}
            <Route path="/teacher-options" element={<TeacherOptions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-teacher" element={<TeacherRegister />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-student" element={<StudentRegistration />} />
            <Route path="/register-student-public" element={<PublicStudentRegistration />} />
            <Route path="/live-attendance" element={<LiveAttendance />} />
            <Route path="/group-attendance" element={<GroupAttendance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/student-list/:className" element={<StudentList />} />
            {/* HOD Routes */}
            <Route path="/hod-options" element={<HODOptions />} />
            <Route path="/hod-login" element={<HODLogin />} />
            <Route path="/hod-register" element={<HODRegister />} />
            <Route path="/hod-dashboard" element={<HODDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

