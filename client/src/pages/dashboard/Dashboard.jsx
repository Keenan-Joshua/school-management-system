import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-800">School Management System</h1>
                <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.full_name} — <span className="capitalize">{user?.role}</span>
          </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-700">
                    Welcome, {user?.full_name}!
                </h2>
                <p className="text-gray-500 mt-1">
                    You are logged in as <span className="font-medium capitalize">{user?.role}</span>.
                </p>

                {/* Module navigation cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <Link
                        to="/students"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
                    >
                        <p className="text-2xl mb-2">🎓</p>
                        <p className="font-medium text-gray-700">Student Registration</p>
                    </Link>
                    <Link
                        to="/teachers"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
                    >
                        <p className="text-2xl mb-2">👩‍🏫</p>
                        <p className="font-medium text-gray-700">Teacher Management</p>
                    </Link>
                    <Link
                        to="/attendance"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
                    >
                        <p className="text-2xl mb-2">📋</p>
                        <p className="font-medium text-gray-700">Attendance Tracking</p>
                    </Link>
                    <Link
                        to="/grades"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
                    >
                        <p className="text-2xl mb-2">📝</p>
                        <p className="font-medium text-gray-700">Grades & Report Cards</p>
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;