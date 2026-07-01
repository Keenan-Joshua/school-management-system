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
import Holidays from './pages/holidays/Holidays';
import Users from './pages/users/Users';
import Layout from './components/Layout';

const PrivateRoute = ({ children, allowedRoles, pageTitle }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) return <Navigate to="/login" />;
    if (user?.force_password_reset) return <Navigate to="/force-password-reset" />;
    if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" />;

    return <Layout pageTitle={pageTitle}>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/force-password-reset" element={<ForcePasswordReset />} />

                <Route path="/dashboard" element={
                    <PrivateRoute pageTitle="Dashboard">
                        <Dashboard />
                    </PrivateRoute>
                } />

                <Route path="/students" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher']} pageTitle="Student Registration">
                        <Students />
                    </PrivateRoute>
                } />

                <Route path="/teachers" element={
                    <PrivateRoute allowedRoles={['administrator']} pageTitle="Teacher Management">
                        <Teachers />
                    </PrivateRoute>
                } />

                <Route path="/attendance" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']} pageTitle="Attendance Tracking">
                        <Attendance />
                    </PrivateRoute>
                } />

                <Route path="/grades" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']} pageTitle="Grades & Report Cards">
                        <Grades />
                    </PrivateRoute>
                } />

                <Route path="/announcements" element={
                    <PrivateRoute allowedRoles={['administrator', 'teacher', 'parent']} pageTitle="School Announcements">
                        <Announcements />
                    </PrivateRoute>
                } />

                <Route path="/holidays" element={
                    <PrivateRoute allowedRoles={['administrator']} pageTitle="Holiday Management">
                        <Holidays />
                    </PrivateRoute>
                } />

                <Route path="/users" element={
                    <PrivateRoute allowedRoles={['administrator']} pageTitle="User Accounts">
                        <Users />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;