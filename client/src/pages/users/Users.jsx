import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserForm from './UserForm';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

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

    const handleFormClose = () => {
        setShowForm(false);
        fetchUsers();
    };

    const roleBadge = (role) => {
        if (role === 'administrator') return 'bg-purple-100 text-purple-700';
        if (role === 'teacher') return 'bg-green-100 text-green-700';
        if (role === 'parent') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (loading) return <p className="p-8 text-gray-500">Loading users...</p>;

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

            {showForm && <UserForm onClose={handleFormClose} />}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Full Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Created</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
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
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Users;