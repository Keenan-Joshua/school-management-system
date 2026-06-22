import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForcePasswordReset from './pages/auth/ForcePasswordReset';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/students/Students';
import Teachers from './pages/teachers/Teachers';
import Attendance from './pages/attendance/Attendance';
import Grades from './pages/grades/Grades';
import Announcements from './pages/announcements/Announcements';
import Users from './pages/users/Users';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) return <Navigate to="/login" />;

    if (user?.force_password_reset) {
        return <Navigate to="/force-password-reset" />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/force-password-reset" element={<ForcePasswordReset />} />

                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />

                <Route path="/users" element={
                    <PrivateRoute allowedRoles={['administrator']}>
                        <Users />
                    </PrivateRoute>
                } />

                <Route path="/students" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher']}>
                        <Students />
                    </PrivateRoute>
                } />

                <Route path="/teachers" element={
                    <PrivateRoute allowedRoles={['administrator']}>
                        <Teachers />
                    </PrivateRoute>
                } />

                <Route path="/attendance" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']}>
                        <Attendance />
                    </PrivateRoute>
                } />

                <Route path="/grades" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']}>
                        <Grades />
                    </PrivateRoute>
                } />

                <Route path="/announcements" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']}>
                        <Announcements />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;