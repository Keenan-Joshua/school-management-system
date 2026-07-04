import { useState, useEffect } from 'react';
import api from '../../services/api';
import TeacherForm from './TeacherForm';
import ClassAssignment from './ClassAssignment';
import SubjectAssignment from './SubjectAssignment';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import QuickUserForm from '../../components/QuickUserForm';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('teachers');
    const [createAccountFor, setCreateAccountFor] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const { toast, showToast, hideToast } = useToast();

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

    const confirmDelete = async () => {
        try {
            await api.delete(`/teachers/${teacherToDelete}`);
            setTeacherToDelete(null);
            fetchTeachers();
            showToast('Teacher deleted successfully.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed.', 'error');
            setTeacherToDelete(null);
        }
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setShowForm(true);
    };

    const handleFormClose = (message) => {
        setSelectedTeacher(null);
        setShowForm(false);
        if (message) showToast(message);
        fetchTeachers();
    };

    const filtered = teachers.filter(t =>
        t.full_name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner message="Loading teachers..." />;

    return (
        <div className="p-8">

            {/* Tab bar */}
            {isAdmin && (
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {['teachers', 'classes', 'subjects'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                                activeTab === tab
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'teachers' ? 'Teacher Profiles' :
                                tab === 'classes' ? 'Class Assignment' :
                                    'Subject Assignment'}
                        </button>
                    ))}
                </div>
            )}

            {/* Teacher Profiles tab */}
            {activeTab === 'teachers' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-700">Teacher Management</h2>
                        {isAdmin && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                            >
                                + Add Teacher
                            </button>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                <th className="px-4 py-3 text-left">Date Joined</th>
                                {isAdmin && <th className="px-4 py-3 text-left">Actions</th>}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
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
                                        <td className="px-4 py-3">
                                            {new Date(teacher.date_joined).toLocaleDateString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-4 py-3 flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="text-emerald-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                {!teacher.has_account && (
                                                    <button
                                                        onClick={() => setCreateAccountFor(teacher)}
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        Create Account
                                                    </button>
                                                )}

                                                {teacher.has_account && (
                                                    <span className="text-xs text-gray-400">Account exists</span>
                                                )}
                                                <button
                                                    onClick={() => setTeacherToDelete(teacher.id)}
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
                </>
            )}

            {/* Class Assignment tab */}
            {activeTab === 'classes' && isAdmin && (
                <ClassAssignment />
            )}

            {/* Subject Assignment tab */}
            {activeTab === 'subjects' && isAdmin && (
                <SubjectAssignment />
            )}

            {createAccountFor && (
                <QuickUserForm
                    prefill={{
                        full_name: createAccountFor.full_name,
                        email: createAccountFor.email,
                        phone: createAccountFor.phone,
                        gender: createAccountFor.gender,
                        date_joined: createAccountFor.date_joined?.split('T')[0],
                        role: 'teacher',
                    }}
                    onClose={() => setCreateAccountFor(null)}
                />
            )}

            {teacherToDelete && (
                <ConfirmModal
                    title="Delete Teacher"
                    message="Are you sure you want to delete this teacher? This will also remove their class assignment and subject assignments."
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setTeacherToDelete(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}

export default Teachers;