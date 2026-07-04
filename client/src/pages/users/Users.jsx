import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserForm from './UserForm';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [resetUserId, setResetUserId] = useState(null);
    const [resetPassword, setResetPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const filtered = users.filter(u => {
        const matchesSearch =
            u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRole === '' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleFormClose = (message) => {
        setShowForm(false);
        if (message) showToast(message);
        fetchUsers();
    };

    const roleBadge = (role) => {
        if (role === 'administrator') return 'bg-purple-100 text-purple-700';
        if (role === 'teacher') return 'bg-green-100 text-green-700';
        if (role === 'parent') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (loading) return <Spinner message="Loading users..." />;

    return (
        <div className="p-8">

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">User Accounts</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                >
                    + Create User Account
                </button>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
            )}

            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search by name, email or role..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">All Roles</option>
                    <option value="administrator">Administrator</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                </select>
            </div>

            {showForm && <UserForm onClose={handleFormClose} />}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Full Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Created</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        filtered.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{u.full_name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadge(u.role)}`}>
                    {u.role}
                  </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => {
                                        setResetUserId(u.id);
                                        setResetPassword('');
                                        setResetError('');
                                        setResetSuccess('');
                                    }}
                                    className="text-amber-600 hover:underline text-sm"
                                >
                                    Reset Password
                                </button>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {resetUserId && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset User Password</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Set a temporary password for this user. They will be prompted to change it on next login.
                        </p>

                        {resetError && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{resetError}</div>
                        )}
                        {resetSuccess && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">{resetSuccess}</div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Temporary Password</label>
                            <input
                                type="text"
                                value={resetPassword}
                                onChange={e => setResetPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setResetUserId(null)}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={resetLoading || resetPassword.length < 6}
                                onClick={async () => {
                                    setResetLoading(true);
                                    setResetError('');
                                    setResetSuccess('');
                                    try {
                                        const res = await api.put('/auth/admin-reset-password', {
                                            user_id: resetUserId,
                                            new_password: resetPassword,
                                        });
                                        setResetSuccess(res.data.message);
                                        setResetPassword('');
                                    } catch (err) {
                                        setResetError(err.response?.data?.message || 'Reset failed.');
                                    } finally {
                                        setResetLoading(false);
                                    }
                                }}
                                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {resetLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}

export default Users;