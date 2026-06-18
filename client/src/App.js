import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/students/Students';
import Teachers from './pages/teachers/Teachers';
import Attendance from './pages/attendance/Attendance';
import Grades from './pages/grades/Grades';
import Announcements from './pages/announcements/Announcements';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/students" element={
              <PrivateRoute>
                  <Students />
              </PrivateRoute>
          } />
          <Route path="/teachers" element={
              <PrivateRoute>
                  <Teachers />
              </PrivateRoute>
          } />
          <Route path="/attendance" element={
              <PrivateRoute>
                  <Attendance />
              </PrivateRoute>
          } />
          <Route path="/grades" element={
              <PrivateRoute>
                  <Grades />
              </PrivateRoute>
          } />
          <Route path="/announcements" element={
              <PrivateRoute>
                  <Announcements />
              </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
  );
}

export default App;