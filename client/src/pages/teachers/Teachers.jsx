import { useState, useEffect } from 'react';
import api from '../../services/api';
import TeacherForm from './TeacherForm';
import ClassAssignment from './ClassAssignment';

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [search, setSearch] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data);
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return;
        try {
            await api.delete(`/teachers/${id}`);
            fetchTeachers();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setSelectedTeacher(null);
        setShowForm(false);
        fetchTeachers();
    };

    const filtered = teachers.filter(t =>
        t.full_name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.specialisation.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="p-8 text-gray-500">Loading teachers...</p>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Teacher Management</h2>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        + Add Teacher
                    </button>
                )}
            </div>

            <input
                type="text"
                placeholder="Search by name, email or specialisation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showForm && (
                <TeacherForm
                    teacher={selectedTeacher}
                    onClose={handleFormClose}
                />
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Full Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Phone</th>
                        <th className="px-4 py-3 text-left">Gender</th>
                        <th className="px-4 py-3 text-left">Specialisation</th>
                        <th className="px-4 py-3 text-left">Date Joined</th>
                        {isAdmin && <th className="px-4 py-3 text-left">Actions</th>}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                                No teachers found.
                            </td>
                        </tr>
                    ) : (
                        filtered.map(teacher => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{teacher.full_name}</td>
                                <td className="px-4 py-3">{teacher.email}</td>
                                <td className="px-4 py-3">{teacher.phone}</td>
                                <td className="px-4 py-3 capitalize">{teacher.gender}</td>
                                <td className="px-4 py-3">{teacher.specialisation}</td>
                                <td className="px-4 py-3">
                                    {new Date(teacher.date_joined).toLocaleDateString()}
                                </td>
                                {isAdmin && (
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {isAdmin && <ClassAssignment />}
        </div>
    );
}

export default Teachers;